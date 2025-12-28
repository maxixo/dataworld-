import sys
from pathlib import Path
p = Path(r"c:\Users\HP\Documents\dataworld\screen.png")
if not p.exists():
    print("ERROR: file not found", file=sys.stderr)
    sys.exit(2)
with p.open('rb') as f:
    sig = f.read(8)
    if sig[:8] != b"\x89PNG\r\n\x1a\n":
        print("ERROR: not a PNG", file=sys.stderr)
        sys.exit(2)
    f.read(8)  # chunk length + IHDR
    width = int.from_bytes(f.read(4), 'big')
    height = int.from_bytes(f.read(4), 'big')
    # skip remaining IHDR data (5 bytes left of IHDR) and CRC
    f.read(5 + 4)
    dpi_info = None
    # scan for pHYs chunk
    while True:
        chunk = f.read(8)
        if len(chunk) < 8:
            break
        length = int.from_bytes(chunk[:4], 'big')
        ctype = chunk[4:8]
        data = f.read(length)
        crc = f.read(4)
        if ctype == b'pHYs':
            ppux = int.from_bytes(data[0:4], 'big')
            ppuy = int.from_bytes(data[4:8], 'big')
            unit = data[8]
            dpi_x = None
            dpi_y = None
            if unit == 1:
                # pixels per meter -> convert to DPI
                dpi_x = ppux * 0.0254
                dpi_y = ppuy * 0.0254
            dpi_info = (ppux, ppuy, unit, dpi_x, dpi_y)
            break
    print(f"WIDTH:{width}")
    print(f"HEIGHT:{height}")
    if dpi_info:
        ppux, ppuy, unit, dpi_x, dpi_y = dpi_info
        print(f"PPUX:{ppux}")
        print(f"PPUY:{ppuy}")
        print(f"UNIT:{unit}")
        if dpi_x and dpi_y:
            print(f"DPI_X:{dpi_x:.2f}")
            print(f"DPI_Y:{dpi_y:.2f}")
    else:
        print("DPI:unknown")
