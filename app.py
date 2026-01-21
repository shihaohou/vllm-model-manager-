#!/usr/bin/env python3
"""
vLLM Model Manager
一个用于管理和监控vLLM模型服务的Web管理系统
"""

from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import subprocess
import os
import psutil
import json
from datetime import datetime
from pathlib import Path

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# 从配置文件加载服务配置
CONFIG_FILE = Path(__file__).parent / 'config' / 'services.json'

def load_services_config():
    """加载服务配置"""
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

SERVICES = load_services_config()

def get_gpu_info():
    """获取GPU信息"""
    try:
        result = subprocess.run(
            ['nvidia-smi', '--query-gpu=index,name,utilization.gpu,memory.used,memory.total,temperature.gpu,power.draw,power.limit',
             '--format=csv,noheader,nounits'],
            capture_output=True,
            text=True,
            timeout=5
        )

        if result.returncode != 0:
            return []

        gpus = []
        for line in result.stdout.strip().split('\n'):
            if line.strip():
                parts = [p.strip() for p in line.split(',')]
                if len(parts) >= 8:
                    gpus.append({
                        'index': int(parts[0]),
                        'name': parts[1],
                        'utilization': float(parts[2]) if parts[2] != '[N/A]' else 0,
                        'memory_used': float(parts[3]) if parts[3] != '[N/A]' else 0,
                        'memory_total': float(parts[4]) if parts[4] != '[N/A]' else 0,
                        'temperature': float(parts[5]) if parts[5] != '[N/A]' else 0,
                        'power_draw': float(parts[6]) if parts[6] != '[N/A]' else 0,
                        'power_limit': float(parts[7]) if parts[7] != '[N/A]' else 0
                    })
        return gpus
    except Exception as e:
        print(f"获取GPU信息失败: {e}")
        return []

def get_process_gpu_usage(pid):
    """获取特定进程的GPU使用情况"""
    try:
        result = subprocess.run(
            ['nvidia-smi', '--query-compute-apps=pid,used_memory', '--format=csv,noheader,nounits'],
            capture_output=True,
            text=True,
            timeout=5
        )

        if result.returncode != 0:
            return None

        for line in result.stdout.strip().split('\n'):
            if line.strip():
                parts = [p.strip() for p in line.split(',')]
                if len(parts) >= 2 and parts[0] == str(pid):
                    return float(parts[1])
        return None
    except Exception as e:
        print(f"获取进程GPU使用失败: {e}")
        return None

def check_service_status(service_key):
    """检查服务状态"""
    service = SERVICES[service_key]

    try:
        # 检查进程是否运行
        result = subprocess.run(
            ['pgrep', '-f', service['process_pattern']],
            capture_output=True,
            text=True
        )

        if result.returncode == 0 and result.stdout.strip():
            pid = int(result.stdout.strip().split('\n')[0])

            # 获取进程信息
            try:
                proc = psutil.Process(pid)
                cpu_percent = proc.cpu_percent(interval=0.1)
                memory_info = proc.memory_info()
                memory_mb = memory_info.rss / 1024 / 1024

                # 检查端口是否可访问
                port_check = subprocess.run(
                    ['curl', '-s', f'http://localhost:{service["port"]}/health'],
                    capture_output=True,
                    timeout=2
                )
                port_accessible = port_check.returncode == 0

                # 获取该进程的GPU使用情况
                gpu_memory = get_process_gpu_usage(pid)

                return {
                    'status': 'running',
                    'pid': pid,
                    'cpu_percent': cpu_percent,
                    'memory_mb': memory_mb,
                    'port_accessible': port_accessible,
                    'gpu_memory_mb': gpu_memory,
                    'uptime': datetime.fromtimestamp(proc.create_time()).strftime('%Y-%m-%d %H:%M:%S')
                }
            except psutil.NoSuchProcess:
                return {'status': 'stopped'}
        else:
            return {'status': 'stopped'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

@app.route('/')
def index():
    """主页"""
    return render_template('index.html')

@app.route('/api/services')
def get_services():
    """获取所有服务状态"""
    services_status = {}

    for key, service in SERVICES.items():
        status = check_service_status(key)
        services_status[key] = {
            'name': service['name'],
            'port': service['port'],
            'gpus': service.get('gpus', []),
            **status
        }

    return jsonify(services_status)

@app.route('/api/gpu')
def get_gpu():
    """获取GPU信息"""
    gpu_info = get_gpu_info()
    return jsonify(gpu_info)

@app.route('/api/service/<service_key>/start', methods=['POST'])
def start_service(service_key):
    """启动服务"""
    if service_key not in SERVICES:
        return jsonify({'success': False, 'message': '服务不存在'}), 404

    service = SERVICES[service_key]

    # 检查是否已经运行
    status = check_service_status(service_key)
    if status['status'] == 'running':
        return jsonify({'success': False, 'message': '服务已在运行中'})

    try:
        # 执行启动脚本
        result = subprocess.run(
            ['bash', service['start_script']],
            capture_output=True,
            text=True,
            timeout=300
        )

        if result.returncode == 0:
            return jsonify({'success': True, 'message': '服务启动成功', 'output': result.stdout})
        else:
            return jsonify({'success': False, 'message': '服务启动失败', 'error': result.stderr})
    except subprocess.TimeoutExpired:
        return jsonify({'success': False, 'message': '启动超时'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/service/<service_key>/stop', methods=['POST'])
def stop_service(service_key):
    """停止服务"""
    if service_key not in SERVICES:
        return jsonify({'success': False, 'message': '服务不存在'}), 404

    service = SERVICES[service_key]

    # 检查是否在运行
    status = check_service_status(service_key)
    if status['status'] != 'running':
        return jsonify({'success': False, 'message': '服务未运行'})

    try:
        # 执行停止脚本
        result = subprocess.run(
            ['bash', service['stop_script']],
            capture_output=True,
            text=True,
            timeout=30
        )

        if result.returncode == 0:
            return jsonify({'success': True, 'message': '服务停止成功', 'output': result.stdout})
        else:
            return jsonify({'success': False, 'message': '服务停止失败', 'error': result.stderr})
    except subprocess.TimeoutExpired:
        return jsonify({'success': False, 'message': '停止超时'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/service/<service_key>/logs')
def get_logs(service_key):
    """获取服务日志"""
    if service_key not in SERVICES:
        return jsonify({'success': False, 'message': '服务不存在'}), 404

    service = SERVICES[service_key]
    lines = request.args.get('lines', 100, type=int)

    try:
        if os.path.exists(service['log_file']):
            result = subprocess.run(
                ['tail', '-n', str(lines), service['log_file']],
                capture_output=True,
                text=True,
                timeout=5
            )
            return jsonify({'success': True, 'logs': result.stdout})
        else:
            return jsonify({'success': False, 'message': '日志文件不存在'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/system')
def get_system_info():
    """获取系统信息"""
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')

        return jsonify({
            'cpu_percent': cpu_percent,
            'memory_percent': memory.percent,
            'memory_used_gb': memory.used / 1024 / 1024 / 1024,
            'memory_total_gb': memory.total / 1024 / 1024 / 1024,
            'disk_percent': disk.percent,
            'disk_used_gb': disk.used / 1024 / 1024 / 1024,
            'disk_total_gb': disk.total / 1024 / 1024 / 1024
        })
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    # 启动服务
    port = int(os.environ.get('PORT', 9000))
    host = os.environ.get('HOST', '0.0.0.0')

    print("=" * 60)
    print("🚀 vLLM Model Manager")
    print("=" * 60)
    print(f"访问地址: http://{host}:{port}")
    print(f"配置文件: {CONFIG_FILE}")
    print(f"管理服务数: {len(SERVICES)}")
    print("=" * 60)

    app.run(host=host, port=port, debug=False)
