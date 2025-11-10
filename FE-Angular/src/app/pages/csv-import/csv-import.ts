import { Component } from '@angular/core';

@Component({
  selector: 'app-csv-import',
  imports: [],
  templateUrl: './csv-import.html',
  styleUrl: './csv-import.css',
})
export class CsvImport {
  /** CSVファイルの内容を保持する変数 */
  public csvContent: string = '';

  /** ファイルのオブジェクト自体の読み取り */
  public onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      console.warn('ファイルが選択されていません');
      return;
    }

    // CSVファイルの厳密なチェック
    if (!this.isValidCsvFile(file)) {
      console.error(
        'CSVファイル以外は選択できません。選択されたファイル:',
        file.name
      );
      return;
    }

    this.readCsv(file);
  }

  /**  */
  private isValidCsvFile(file: File): boolean {
    const validTypes = ['text/csv', 'application/csv', 'text/plain'];
    const validExtensions = ['.csv'];
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    return hasValidType || hasValidExtension;
  }

  /** 読み込んだCSVファイルオブジェクトの中身の読み取り */
  private readCsv(file: File): void {
    const reader = new FileReader();

    // エラーハンドリング
    reader.onerror = () => {
      console.error('ファイル読み取りエラー:', reader.error);
    };

    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result;

        if (typeof csvContent !== 'string') {
          console.error('ファイル内容が文字列として読み取れませんでした');
          return;
        }

        console.log('CSVファイルの内容: ', csvContent);
        this.csvContent = csvContent;

        // より堅牢なCSV解析
        const parseData = this.parseCsvContent(csvContent);
        console.log('CSVデータ（解析後）:', parseData);
      } catch (error) {
        console.error('CSV解析エラー:', error);
      }
    };
    reader.readAsText(file, 'UTF-8');
  }

  private parseCsvContent(csvContent: string): string[][] {
    // 行ごとに分割（空行は除去）
    const lines = csvContent
      .split(/\r?\n/) // Windows/Unix両方の改行に対応
      .filter((line) => line.trim() !== '')
      .filter((line) => !line.startsWith('#')); // コメント行を除去
    console.log('CSVデータ（行ごと）:', lines);

    // より堅牢なCSVパース（引用符対応）
    const csvData = lines.map((line) => this.parseCSVLine(line));

    return csvData;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }
}
