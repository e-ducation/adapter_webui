from microbit import *  # sleep, uart, button_a, display
import microbit
import radio

uart.init(115200)

_version = 1.0

while True:
    # msg = uart.readline() # no block . because timeout -> 0 ?
    msg = uart.read(1024)
    if msg:
        msg_str = str(msg, 'UTF-8')
        try:
            output = eval(msg_str)
        except Exception as e:
            output = e
        # uart.write(str(output) + "\n")
        print(str(output))