import qrcode
from PIL import Image, ImageDraw
import argparse
import os
from datetime import datetime

def create_rounded_qr(data, output_dir="qr_codes", filename=None, size=10, border=2, 
                      fill_color="black", back_color="white", radius_percent=10, 
                      error_correction=qrcode.constants.ERROR_CORRECT_H):
    """
    Generate a professional QR code with rounded corners.
    
    Parameters:
    - data: The text/URL to encode in the QR code
    - output_dir: Directory to save the QR code image
    - filename: Name for the output file (default: timestamped)
    - size: Size of the QR code (box size in pixels)
    - border: Border size (quiet zone)
    - fill_color: Color of the QR code (default: black)
    - back_color: Background color (default: white)
    - radius_percent: Corner radius as percentage of module size (0-100)
    - error_correction: Error correction level
    
    Returns:
    - Path to the generated QR code image
    """
    # Create QR code instance
    qr = qrcode.QRCode(
        version=1,
        error_correction=error_correction,
        box_size=size,
        border=border
    )
    
    # Add data to QR code
    qr.add_data(data)
    qr.make(fit=True)
    
    # Create QR code image (temporarily with square modules)
    qr_image = qr.make_image(fill_color=fill_color, back_color=back_color)
    qr_image = qr_image.convert("RGBA")
    
    # Create a blank image with the same size
    width, height = qr_image.size
    rounded_image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(rounded_image)
    
    # Calculate module size (includes spacing)
    module_size = size
    radius = int(module_size * radius_percent / 100)
    
    # Find QR code modules
    pixels = qr_image.load()
    
    # Start iterating after the quiet zone
    start_pos = border * module_size
    end_x = width - border * module_size
    end_y = height - border * module_size
    
    # Placeholder for tracking modules to draw with rounded corners
    modules = []
    
    # Identify individual modules
    for y in range(start_pos, end_y, module_size):
        for x in range(start_pos, end_x, module_size):
            # Check if this is a filled module
            if pixels[x, y][3] > 0 and pixels[x, y][0:3] == (0, 0, 0):  # If it's black and visible
                modules.append((x, y))
    
    # Function to determine if a module is connected to others
    def is_connected(x, y, direction):
        dx, dy = {
            'top': (0, -module_size),
            'right': (module_size, 0),
            'bottom': (0, module_size),
            'left': (-module_size, 0)
        }[direction]
        
        check_x, check_y = x + dx, y + dy
        return (check_x, check_y) in modules
    
    # Draw each module, possibly with rounded corners
    for x, y in modules:
        # Check connections in all four directions
        connections = {
            'top': is_connected(x, y, 'top'),
            'right': is_connected(x, y, 'right'),
            'bottom': is_connected(x, y, 'bottom'),
            'left': is_connected(x, y, 'left')
        }
        
        # Draw the module (rectangle with potentially rounded corners)
        # For corners that should be rounded
        corners = [
            (x, y, x + module_size, y + module_size),  # base rectangle
            (x, y, x + radius, y + radius),  # top-left
            (x + module_size - radius, y, x + module_size, y + radius),  # top-right
            (x, y + module_size - radius, x + radius, y + module_size),  # bottom-left
            (x + module_size - radius, y + module_size - radius, x + module_size, y + module_size)  # bottom-right
        ]
        
        # Base rectangle (filled)
        draw.rectangle(corners[0], fill=fill_color)
        
        # Top-left corner
        if not (connections['top'] and connections['left']):
            draw.rectangle(corners[1], fill=back_color)
            draw.pieslice((x, y, x + 2*radius, y + 2*radius), 180, 270, fill=fill_color)
        
        # Top-right corner
        if not (connections['top'] and connections['right']):
            draw.rectangle(corners[2], fill=back_color)
            draw.pieslice((x + module_size - 2*radius, y, x + module_size, y + 2*radius), 270, 0, fill=fill_color)
        
        # Bottom-left corner
        if not (connections['bottom'] and connections['left']):
            draw.rectangle(corners[3], fill=back_color)
            draw.pieslice((x, y + module_size - 2*radius, x + 2*radius, y + module_size), 90, 180, fill=fill_color)
        
        # Bottom-right corner
        if not (connections['bottom'] and connections['right']):
            draw.rectangle(corners[4], fill=back_color)
            draw.pieslice((x + module_size - 2*radius, y + module_size - 2*radius, x + module_size, y + module_size), 0, 90, fill=fill_color)
    
    # Prepare output directory
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Create filename if not provided
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"qrcode_{timestamp}.png"
    elif not filename.endswith(('.png', '.jpg', '.jpeg')):
        filename += '.png'
    
    # Save the QR code
    output_path = os.path.join(output_dir, filename)
    rounded_image.save(output_path)
    
    return output_path

def main():
    # Set up command line arguments
    parser = argparse.ArgumentParser(description='Generate professional QR codes with rounded corners')
    parser.add_argument('data', help='The text or URL to encode in the QR code')
    parser.add_argument('--output', '-o', help='Output filename', default=None)
    parser.add_argument('--size', '-s', type=int, help='QR code size (box size in pixels)', default=10)
    parser.add_argument('--border', '-b', type=int, help='Border size (quiet zone)', default=2)
    parser.add_argument('--fill', '-f', help='QR code fill color', default='black')
    parser.add_argument('--background', '-bg', help='Background color', default='white')
    parser.add_argument('--radius', '-r', type=int, help='Corner radius percentage (0-100)', default=10)
    parser.add_argument('--directory', '-d', help='Output directory', default='qr_codes')
    
    args = parser.parse_args()
    
    # Generate and save the QR code
    output_path = create_rounded_qr(
        args.data,
        output_dir=args.directory,
        filename=args.output,
        size=args.size,
        border=args.border,
        fill_color=args.fill,
        back_color=args.background,
        radius_percent=args.radius
    )
    
    print(f"QR code generated successfully and saved to: {output_path}")

if __name__ == "__main__":
    main()