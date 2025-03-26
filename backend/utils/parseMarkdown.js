// utils/parseMarkdown.js
const parseMarkdownTable = (markdown) => {
    const rows = markdown.split("\n").filter(row => row.startsWith("|"));
    if (rows.length < 3) return [];
    const headers = rows[0].split("|").map(h => h.trim()).filter(h => h);
    return rows.slice(2).map(row => {
        const columns = row.split("|").map(c => c.trim()).filter(c => c);
        return Object.fromEntries(headers.map((h, i) => [h, columns[i] || ""]));
    });
};

module.exports = { parseMarkdownTable };