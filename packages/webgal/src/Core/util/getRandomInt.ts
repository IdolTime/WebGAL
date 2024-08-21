
/**
 * 生成随机数: 大于最小值且小于最大数的整数
 * @param min
 * @param max
 * @return {number} 介于最小值和最大值之间的整数
 */
export function getRandomInt(min: number, max: number) {
    if (typeof min !== 'number') min = 0;
    if (typeof max !== 'number') min = 0
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min - 1)) + min + 1;
}