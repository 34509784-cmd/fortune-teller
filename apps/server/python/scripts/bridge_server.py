#!/usr/bin/env python3
"""
Fortune Teller — Python Bridge Server
Long-running JSON-IPC bridge for computation that requires Python libraries.
Communicates via stdin/stdout with null-byte delimited JSON messages.
"""

import sys
import json
import traceback

def handle_bazi(payload):
    """Calculate Ba Zi using lunar-python (when available)."""
    try:
        from lunar_python import Solar, Lunar
        birth_date = payload.get('birthDate')
        birth_time = payload.get('birthTime', '00:00')
        gender = payload.get('gender', 'MALE')

        # Parse date
        parts = birth_date.split('-')
        year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
        time_parts = birth_time.split(':')
        hour, minute = int(time_parts[0]), int(time_parts[1])

        solar = Solar.fromYmdHms(year, month, day, hour, minute, 0)
        lunar = solar.getLunar()

        return {
            'success': True,
            'fourPillars': {
                'year': {'stem': lunar.getYearInGanZhiExact()[0], 'branch': lunar.getYearInGanZhiExact()[1]},
                'month': {'stem': lunar.getMonthInGanZhiExact()[0], 'branch': lunar.getMonthInGanZhiExact()[1]},
                'day': {'stem': lunar.getDayInGanZhiExact()[0], 'branch': lunar.getDayInGanZhiExact()[1]},
                'hour': {'stem': lunar.getTimeInGanZhi()[0], 'branch': lunar.getTimeInGanZhi()[1]},
            },
            'dayMaster': lunar.getDayInGanZhiExact()[0],
        }
    except ImportError:
        return {'success': False, 'error': 'lunar-python not installed'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def handle_qimen(payload):
    """Calculate Qi Men Dun Jia plate using kinqimen (when available)."""
    try:
        from kinqimen import Qimen
        date_time = payload.get('queryDateTime', '')
        method = payload.get('method', 'CHAIBU')

        # Parse ISO datetime
        dt = date_time.replace('T', ' ').replace('Z', '')
        parts = dt.split(' ')[0].split('-')
        time_part = dt.split(' ')[1] if ' ' in dt else '00:00'
        time_parts = time_part.split(':')

        year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
        hour = int(time_parts[0])

        pan_method = 1 if method == 'CHAIBU' else 2
        qimen = Qimen(year, month, day, hour)
        result = qimen.pan(pan_method)

        return {'success': True, 'data': result}
    except ImportError:
        return {'success': False, 'error': 'kinqimen not installed'}
    except Exception as e:
        return {'success': False, 'error': str(e), 'trace': traceback.format_exc()}

def main():
    """Main loop: read JSON from stdin, write JSON to stdout."""
    handlers = {
        'bazi': handle_bazi,
        'qimen': handle_qimen,
    }

    buffer = ''
    while True:
        try:
            # Read until null byte
            char = sys.stdin.read(1)
            if not char:
                break  # EOF

            if char == '\0':
                # Process complete message
                if buffer.strip():
                    try:
                        msg = json.loads(buffer)
                        action = msg.get('action', '')
                        payload = msg.get('payload', {})

                        handler = handlers.get(action)
                        if handler:
                            result = handler(payload)
                        else:
                            result = {'success': False, 'error': f'Unknown action: {action}'}

                        response = json.dumps(result, ensure_ascii=False)
                        sys.stdout.write(response + '\0')
                        sys.stdout.flush()
                    except json.JSONDecodeError as e:
                        sys.stdout.write(json.dumps({'success': False, 'error': f'Invalid JSON: {e}'}) + '\0')
                        sys.stdout.flush()
                buffer = ''
            else:
                buffer += char

        except KeyboardInterrupt:
            break
        except Exception as e:
            sys.stdout.write(json.dumps({'success': False, 'error': str(e)}) + '\0')
            sys.stdout.flush()

if __name__ == '__main__':
    main()
