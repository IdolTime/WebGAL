// eslint-disable-next-line max-params
export function smoothScrollToElement(element: HTMLElement, targetX: number, targetY: number, duration = 500) {
  const startX = element.scrollLeft;
  const startY = element.scrollTop;
  const distanceX = targetX - startX;
  const distanceY = targetY - startY;
  const startTime = performance.now();

  function scrollStep(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1); // 限制 progress 在 0 到 1 之间
    const easing = easeInOutQuad(progress); // 使用缓动函数进行平滑滚动

    element.scrollTo(startX + distanceX * easing, startY + distanceY * easing);

    if (elapsed < duration) {
      requestAnimationFrame(scrollStep);
    }
  }

  function easeInOutQuad(t: number) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  requestAnimationFrame(scrollStep);
}
