export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    const normalizedItems = this.normalizeItemsForUser(user, items);
    const { rows, total } = this.buildRows(reportType, user, normalizedItems);

    return this.composeReport(reportType, user, rows, total);
  }

  normalizeItemsForUser(user, items) {
    if (user.role === 'ADMIN') {
      return items.map((item) => this.applyPriority(item));
    }

    if (user.role === 'USER') {
      return items.filter((item) => item.value <= 500);
    }

    return [];
  }

  applyPriority(item) {
    if (item.value > 1000) {
      return { ...item, priority: true };
    }

    return { ...item };
  }

  buildRows(reportType, user, items) {
    let total = 0;
    const rows = [];

    for (const item of items) {
      total += item.value;
      rows.push(this.formatRow(reportType, user, item));
    }

    return { rows, total };
  }

  formatRow(reportType, user, item) {
    if (reportType === 'CSV') {
      return `${item.id},${item.name},${item.value},${user.name}`;
    }

    if (reportType === 'HTML') {
      if (user.role === 'ADMIN') {
        const style = item.priority ? 'style="font-weight:bold;"' : '';
        return `<tr ${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>`;
      }

      return `<tr><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>`;
    }

    return '';
  }

  composeReport(reportType, user, rows, total) {
    if (reportType === 'CSV') {
      return this.composeCsvReport(rows, total);
    }

    if (reportType === 'HTML') {
      return this.composeHtmlReport(user, rows, total);
    }

    return '';
  }

  composeCsvReport(rows, total) {
    const header = 'ID,NOME,VALOR,USUARIO';
    const body = rows.join('\n');
    const footer = `\nTotal,,\n${total},,`;

    return `${header}\n${body}${footer}`.trim();
  }

  composeHtmlReport(user, rows, total) {
    const header = [
      '<html><body>',
      '<h1>Relatório</h1>',
      `<h2>Usuário: ${user.name}</h2>`,
      '<table>',
      '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>',
    ].join('\n');

    const body = rows.join('\n');
    const footer = [
      '</table>',
      `<h3>Total: ${total}</h3>`,
      '</body></html>',
    ].join('\n');

    return `${header}\n${body}\n${footer}`.trim();
  }
}
