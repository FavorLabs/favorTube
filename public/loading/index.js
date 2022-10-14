var percent = document.querySelector('#loading-percent-num');
if (percent) {
  let timer = setInterval(() => {
    let num = Number(percent.innerHTML);
    if (num < 97) {
      percent.innerHTML = num + 3;
    } else {
      clearInterval(timer);
    }
  }, 100);
}