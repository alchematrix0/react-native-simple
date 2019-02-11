module.exports = {
  getSuggestions: function (name, postAt) {
    const domains = [
      "aol.com", "att.net", "comcast.net", "facebook.com", "gmail.com", "gmx.com", "googlemail.com", "gmail.co.uk",
      "google.com", "hotmail.com", "hotmail.co.uk", "mac.com", "me.com", "mail.com", "msn.com",
      "live.com", "sbcglobal.net", "verizon.net", "yahoo.com", "yahoo.co.uk",
    ]
    let mainSuggestions = [
      `${name}@gmail.com`,
      `${name}@yahoo.com`,
      `${name}@hotmail.com`,
      `${name}@outlook.com`,
      `${name}@live.com`,
    ]
    return postAt ? domains.filter(d => d.slice(0, postAt.length) === postAt).map(suggest => `${name}@${suggest}`) : mainSuggestions
  }
}
