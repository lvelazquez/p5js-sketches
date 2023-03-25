function ease(t, type) {
  switch (type) {
    case "linear":
      return t;
    case "quadraticIn":
      return t * t;
    case "quadraticOut":
      return t * (2 - t);
    case "quadraticInOut":
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case "cubicIn":
      return t * t * t;
    case "cubicOut":
      return --t * t * t + 1;
    case "cubicInOut":
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    case "quarticIn":
      return t * t * t * t;
    case "quarticOut":
      return 1 - --t * t * t * t;
    case "quarticInOut":
      return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
    case "quinticIn":
      return t * t * t * t * t;
    case "quinticOut":
      return 1 + --t * t * t * t * t;
    case "quinticInOut":
      return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
    case "sinusoidalIn":
      return 1 - Math.cos((t * Math.PI) / 2);
    case "sinusoidalOut":
      return Math.sin((t * Math.PI) / 2);
    case "sinusoidalInOut":
      return 0.5 * (1 - Math.cos(Math.PI * t));
    case "exponentialIn":
      return Math.pow(2, 10 * (t - 1));
    case "exponentialOut":
      return 1 - Math.pow(2, -10 * t);
    case "exponentialInOut":
      return t < 0.5
        ? 0.5 * Math.pow(2, 10 * (2 * t - 1))
        : 0.5 * (2 - Math.pow(2, -10 * (2 * t - 1)));
    case "circularIn":
      return 1 - Math.sqrt(1 - t * t);
    case "circularOut":
      return Math.sqrt(1 - --t * t);
    case "circularInOut":
      return t < 0.5
        ? 0.5 * (1 - Math.sqrt(1 - 4 * t * t))
        : 0.5 * (Math.sqrt(-(2 * t - 3) * (2 * t - 1)) + 1);
    case "bounce":
      if (t < 1 / 2.75) {
        return 7.5625 * t * t;
      } else if (t < 2 / 2.75) {
        t -= 1.5 / 2.75;
        return 7.5625 * t * t + 0.75;
      } else if (t < 2.5 / 2.75) {
        t -= 2.25 / 2.75;
        return 7.5625 * t * t + 0.9375;
      } else {
        t -= 2.625 / 2.75;
        return 7.5625 * t * t + 0.984375;
      }      
    case "springy":
      const omega = 3 * Math.PI;
      return 1 - Math.cos(t * omega * 0.5) * Math.exp(-t * omega);
    default:
      return t;
  }
}

function elastic(t, amplitude, period) {
  if (t == 0 || t == 1) return t;
  let s = period / (2 * Math.PI) * Math.asin(1 / amplitude);
  t = t - 1;
  return -(amplitude * Math.pow(2, 10 * t) * Math.sin((t - s) * (2 * Math.PI) / period));
}