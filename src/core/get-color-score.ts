import { rgb2hsl } from '.';

export const getColorScore = (params: {
  color: [number, number, number];
  metric?: 'happy';
}) => {
  if (params.metric === 'happy') {
    const hsv = rgb2hsl(params.color[0], params.color[1], params.color[2]);

    // Hue score (warmness)
    const bestWarmnessHue = 0;
    const worstWarmnessHue = 180;

    const closeToBestBy = Math.min(
      Math.abs(hsv.h - 360 + bestWarmnessHue),
      Math.abs(hsv.h + bestWarmnessHue),
    );

    const warmScore = 1 - closeToBestBy / worstWarmnessHue;

    // Saturation score (saturated colors are happier)
    const satScore = hsv.s;

    // Lightness score (not too bright & not too dark colors are happier)
    const lumScore = 1 - Math.abs((hsv.l - 0.5) / 0.5);

    return (warmScore + satScore + lumScore) / 3;
  } else return 0;
};
