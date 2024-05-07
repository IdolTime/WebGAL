import { playSpeed } from '@/store/userDataInterface';

export function useTextDelay(num: number) {
  // [0, 100] => [3, 80]
  if (num === 0) {
    return 3;
  } else if (num === 100) {
    return 80;
  } else {
    return (77 * Number(num)) / 100;
  }
  // switch (type) {
  //   case playSpeed.slow:
  //     return 80;
  //   case playSpeed.normal:
  //     return 35;
  //   case playSpeed.fast:
  //     return 3;
  // }
}

export function useTextAnimationDuration(num: Number) {
  // [0, 100] => [800 , 200]
  if (num === 0) {
    return 800;
  } else if (num === 100) {
    return 200;
  } else {
    return 800 - (600 * Number(num)) / 100;
  }
  // switch (type) {
  //   case playSpeed.slow:
  //     return 800;
  //   case playSpeed.normal:
  //     return 350;
  //   case playSpeed.fast:
  //     return 200;
  // }
  // 800 - (600 * 50) / 100;
}
