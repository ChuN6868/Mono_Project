import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

@Component({
  selector: 'app-ag-grid',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './ag-grid.component.html',
  styleUrl: './ag-grid.component.css'
})
export class AgGridComponent {
  // テーマ設定（新しいTheming API）
  theme = themeQuartz;

  
  

  // デフォルトの列設定（全列に適用される）
  defaultColDef: ColDef = {
    sortable: false, // ソート無効化（デフォルトだとソート機能がある）
    suppressMovable: true, // 列の移動を無効化（デフォルトだとドラッグで列を移動できてしまう）
    wrapText: true, // テキストの折り返しを有効化（長いテキストが自動的に複数行になる。autoHeightとセットで使う。）
    autoHeight: true, // 行の高さを自動調整（セル内容に応じて行の高さが変わる。wrapTextとセットで使う。）
    cellStyle: {
      userSelect: 'text', // テキスト選択を可能にし、コピー可能となる（デフォルトだと文字を選択できない）
    },
  };

  // 列定義
  colDefs: ColDef[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'make', headerName: 'メーカー' },
    { field: 'model', headerName: 'モデル' },
    { field: 'price', headerName: '価格' },
    { field: 'year', headerName: '年式' },
    { field: 'color', headerName: '色' },
    { field: 'mileage', headerName: '走行距離' },
    { field: 'fuelType', headerName: '燃料' },
    { field: 'transmission', headerName: 'トランスミッション' },
    { field: 'status', headerName: 'ステータス' }
  ];

  // 行データ
  rowData = [
    { id: 1, make: 'Toyota', model: 'Celica', price: 35000, year: 2020, color: '白', mileage: 12000, fuelType: 'ガソリン', transmission: 'AT', status: '在庫あり' },
    { id: 2, make: 'Ford', model: 'Mondeo', price: 32000, year: 2019, color: '黒', mileage: 25000, fuelType: 'ガソリン', transmission: 'AT', status: '在庫あり' },
    { id: 3, make: 'Porsche', model: 'Boxster', price: 72000, year: 2021, color: '赤', mileage: 8000, fuelType: 'ガソリン', transmission: 'MT', status: '在庫あり' },
    { id: 4, make: 'Honda', model: 'Civic', price: 28000, year: 2020, color: '青', mileage: 15000, fuelType: 'ガソリン', transmission: 'AT', status: '在庫あり' },
    { id: 5, make: 'Nissan', model: 'Skyline', price: 45000, year: 2022, color: '銀', mileage: 5000, fuelType: 'ガソリン', transmission: 'AT', status: '予約済' },
    { id: 6, make: 'BMW', model: 'M3', price: 65000, year: 2021, color: '白', mileage: 10000, fuelType: 'ガソリン', transmission: 'MT', status: '在庫あり' },
    { id: 7, make: 'Mercedes', model: 'C-Class', price: 55000, year: 2020, color: '黒', mileage: 18000, fuelType: 'ディーゼル', transmission: 'AT', status: '在庫あり' },
    { id: 8, make: 'Audi', model: 'A4', price: 48000, year: 2021, color: '灰', mileage: 12000, fuelType: 'ガソリン', transmission: 'AT', status: '在庫あり' },
    { id: 9, make: 'Mazda', model: 'MX-5', price: 32000, year: 2022, color: '赤', mileage: 3000, fuelType: 'ガソリン', transmission: 'MT', status: '在庫あり' },
    { id: 10, make: 'Subaru', model: 'WRX', price: 42000, year: 2021, color: '青', mileage: 9000, fuelType: 'ガソリン', transmission: 'MT', status: '在庫あり' },
    { id: 11, make: 'Volkswagen', model: 'Golf', price: 30000, year: 2020, color: '白', mileage: 20000, fuelType: 'ガソリン', transmission: 'AT', status: '在庫あり' },
    { id: 12, make: 'Tesla', model: 'Model 3', price: 55000, year: 2023, color: '黒', mileage: 1000, fuelType: '電気', transmission: 'AT', status: '予約済' },
    { id: 13, make: 'Lexus', model: 'IS', price: 52000, year: 2021, color: '銀', mileage: 11000, fuelType: 'ハイブリッド', transmission: 'AT', status: '在庫あり' },
    { id: 14, make: 'Mitsubishi', model: 'Lancer', price: 28000, year: 2019, color: '赤', mileage: 22000, fuelType: 'ガソリン', transmission: 'MT', status: '在庫あり' },
    { id: 15, make: 'Chevrolet', model: 'Camaro', price: 48000, year: 2020, color: '黄', mileage: 14000, fuelType: 'ガソリン', transmission: 'AT', status: '在庫あり' },
    { id: 16, make: 'Jaguar', model: 'F-Type', price: 78000, year: 2022, color: '緑', mileage: 4000, fuelType: 'ガソリン', transmission: 'AT', status: '在庫あり' },
    { id: 17, make: 'Volvo', model: 'S60', price: 45000, year: 2021, color: '白', mileage: 13000, fuelType: 'ハイブリッド', transmission: 'AT', status: '在庫あり' },
    { id: 18, make: 'Alfa Romeo', model: 'Giulia', price: 52000, year: 2020, color: '赤', mileage: 16000, fuelType: 'ガソリン', transmission: 'AT', status: '予約済' },
    { id: 19, make: 'Mini', model: 'Cooper', price: 35000, year: 2022, color: '青', mileage: 6000, fuelType: 'ガソリン', transmission: 'AT', status: '在庫あり' },
    { id: 20, make: '長文あああああああああああああああああああああああああああああああああああああああああああああああああああああ', model: 'i30000000000000000000000000000000000000000000000000000000000000', price: 260000000000000000000000000000000, year: 2021000000000000000000000000000000000, color: '灰', mileage: 17000, fuelType: 'ガソリン', transmission: 'AT', status: '在庫ありaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }
  ];
}
