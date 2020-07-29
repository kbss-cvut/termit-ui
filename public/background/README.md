Background pictures
===================


New picture
-----------

1. Keep original picture
2. Add TXT file with origin and license details
3. Create downscaled blurred version of the picture
	1. Scale to 1920x1080 (FullHD)
	2. Gaussian Blur, radius aprox. 4px
	3. Lower color saturation to aprox. 70%
	4. Save with `*.small-blur.jpg` suffix
		- Use low quality compression; 60% quality should look fine.
		- The size should be less than 150KB.


Termit Configuration
--------------------

Configure Termit to use the background picture in `src/util/Constants.ts` file,
the `LAYOUT_WALLPAPER` constant.

`LAYOUT_WALLPAPER_POSITION` is a background-position CSS property. Configure it
so a desired features in the background picture are visible even when the
screen has unexpected ratio.

