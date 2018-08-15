// Utility functions for client-side code.

/**
 * Formats the subject code to a general version. Example:
 * 16CS552 becomes 16CS55x.
 * @param {string} x - The existing subject code 
 */
exports.getFormattedSubjectCode = (x) => {
    let rgx = /(\d+)([A-Z]+)(\d+)/;
    let matches = x.match(rgx);
    if (matches[2].length == 2 && matches[3].length == 3)
        return x.substr(0, x.length - 1) + "x";
    return x;
};

module.exports = exports;