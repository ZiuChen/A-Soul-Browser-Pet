import browser from 'webextension-polyfill'

console.log('background')

browser.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details)
})
