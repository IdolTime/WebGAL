
export function getLocalDate() {
    let currentDate = new Date();
    // 获取年、月、日、时、分、秒
    let year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, '0'); // 月份是从 0 开始计数的，因此要加 1
    let day = String(currentDate.getDate()).padStart(2, '0');
    let hours = String(currentDate.getHours()).padStart(2, '0');
    let minutes = String(currentDate.getMinutes()).padStart(2, '0');
    let seconds = String(currentDate.getSeconds()).padStart(2, '0');
    // 格式化成 'YYYY-MM-DD HH:mm:ss' 格式
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}