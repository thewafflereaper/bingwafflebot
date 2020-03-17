const DEFAULT_NUM_ITERATIONS = 30;
const DEFAULT_DELAY = 600;

const iterationCount = document.getElementById('iteration-count');
const iterationCountWrapper = document.getElementById('iteration-count-wrapper');

function saveChanges() {
  chrome.storage.local.set({
    numIterations: document.getElementById('numIterations').value,
    delay: document.getElementById('delay').value,
  });
}

let searchInterval;
function startSearches(numIterations, delay) {
  clearInterval(searchInterval);

  const search = (() => {
    let count = 0;
    return () => {
      chrome.tabs.update({
        url: `https://bing.com/search?q=${Math.random().toString(36).substr(2)}`,
      });
      return ++count;
    };
  })();

  search();
  iterationCount.innerText = numIterations - 1;
  iterationCountWrapper.style = 'display: flex;';

  searchInterval = setInterval(() => {
    const count = search();
    if (count >= numIterations) {
      clearInterval(searchInterval);
      iterationCount.innerText = '';
      iterationCountWrapper.style = 'display: none;';
    } else {
      iterationCount.innerText = numIterations - count;
    }
  }, delay);
}

function reset() {
  document.getElementById('numIterations').value = DEFAULT_NUM_ITERATIONS;
  document.getElementById('delay').value = DEFAULT_DELAY;
  saveChanges();
}

// load the saved values from the Chrome extension storage API
chrome.storage.local.get(['numIterations', 'delay'], function(result) {
  const numIterations = result['numIterations'] || DEFAULT_NUM_ITERATIONS;
  const delay = result['delay'] || DEFAULT_DELAY;
  document.getElementById('numIterations').value = numIterations;
  document.getElementById('delay').value = delay;
});

document.getElementById('numIterations').addEventListener('input', saveChanges);
document.getElementById('delay').addEventListener('input', saveChanges);
document.getElementById('go').addEventListener('click', () => {
  startSearches(
    document.getElementById('numIterations').value,
    document.getElementById('delay').value,
  );
});
document.getElementById('reset').addEventListener('click', reset);

chrome.storage.local.get(['autoClick'], ({ autoClick }) => {
  document.getElementById('auto-click').checked = autoClick;
});

document.getElementById('auto-click').addEventListener('change', function() {
  chrome.storage.local.set({ autoClick: this.checked });
});
