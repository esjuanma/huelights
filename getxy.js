function getXY(red, green, blue) {
    if (red > 0.04045) {
        red = Math.pow((red + 0.055) / (1.0 + 0.055), 2.4);
    }
    else red = red / 12.92;

    if (green > 0.04045) {
        green = Math.pow((green + 0.055) / (1.0 + 0.055), 2.4);
    }
    else green = green / 12.92;

    if (blue > 0.04045) {
        blue = Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4);
    }
    else blue = blue / 12.92;

    const X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
    const Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
    const Z = red * 0.000088 + green * 0.072310 + blue * 0.986039;
    const x = X / (X + Y + Z);
    const y = Y / (X + Y + Z);

    return [x, y];
}
