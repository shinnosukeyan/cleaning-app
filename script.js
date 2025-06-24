// Google Sheets API設定（後で設定します）
const GOOGLE_SHEETS_API_KEY = 'AIzaSyAg4ivdU3fTQ1ol48GE03_0RvKZ-_plEDM';
const SPREADSHEET_ID = '14uACNMQ33OebeTnyXHwLzEC4WEkqhZTlP2pMzmp-zJQ';
const SHEET_NAME = 'シート1';

// 全チェック項目リスト
const allChecklistItems = [
    // 入室前チェック
    "ポストチェック",
    "郵便物あり",
    "エレベーター点検日チェック",
    "LINEで報告_エレベーター点検日",
    "キーボックスチェック",
    "予備キーで補填",
    "LINEで報告_キーなし",
    "回収ゴミ撮影",
    
    // 最初に
    "マイク充電",
    "忘れ物チェック",
    "忘れ物あり",
    
    // トイレ掃除
    "詰まりチェック",
    "LINEで報告_詰まり",
    "手洗い台",
    "便座",
    "便器",
    "床_トイレ",
    "汚物入れ袋交換",
    
    // 調理器具チェック
    "洗浄",
    "冷蔵庫",
    "レンジ",
    "ケトル",
    "食器",
    "カトラリー等",
    
    // 各所清掃
    "掃き掃除_テーブル",
    "拭き掃除_テーブル",
    "乾拭き_テーブル",
    "掃き掃除_イス",
    "拭き掃除_イス",
    "掃き掃除_ソファー",
    "拭き掃除_ソファー",
    "家具をズラす",
    "掃き_床",
    "拭き_床",
    
    // 整頓
    "家具整頓",
    "備品整頓",
    
    // 消耗品補充
    "ハンドソープ",
    "中性洗剤",
    "トイレットペーパー",
    "ティッシュ",
    "床シート",
    "ゴミ袋",
    "不足報告",
    "LINEで報告_消耗品",
    
    // 布巾・ダスター
    "洗浄_布巾",
    "干す",
    
    // キッチン
    "シンク洗い",
    "排水溝洗い",
    "シンク周り拭きあげ",
    
    // ゴミ
    "清掃ゴミまとめ",
    "掃除機のカップ",
    
    // 特記事項
    "特記事項あり",
    "LINEで報告_特記事項",
    
    // 最終調整
    "照明色調整",
    "窓閉める",
    "ロールスクリーン上げる",
    "エアコン設定",
    
    // 撮影
    "写真アップロード",
    
    // 戸締り・消灯
    "換気扇オン_奥",
    "換気扇オフ_手前",
    "照明オフ",
    "キッチン照明オン",
    "戸締り",
    "清掃ゴミ出し",
    "回収ゴミ出し"
];

document.getElementById('cleaningForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // バリデーションチェック
    const validationResult = validateForm();
    if (!validationResult.isValid) {
        showValidationError(validationResult.errors);
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const resultMessage = document.getElementById('resultMessage');
    const validationError = document.getElementById('validationError');
    
    // バリデーションエラーを非表示
    validationError.style.display = 'none';
    
    // ボタンを無効化して二重送信を防ぐ
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';
    loading.style.display = 'block';
    result.style.display = 'none';
    
    // フォームデータを収集
    const formData = new FormData(this);
    const reporterName = formData.get('reporterName');
    const checkedItems = formData.getAll('checklist');
    
    // データを準備
    const now = new Date();
    const submittedChecklist = new Set(checkedItems);
    const checklistValues = allChecklistItems.map(item => submittedChecklist.has(item));
    
    // Google Sheetsに送信
    sendToGoogleSheets(now, reporterName, checklistValues)
        .then(response => {
            loading.style.display = 'none';
            result.style.display = 'block';
            
            if (response.success) {
                result.className = 'result success';
                resultMessage.textContent = '報告が完了しました。';
                document.getElementById('cleaningForm').reset();
            } else {
                result.className = 'result error';
                resultMessage.textContent = response.message || 'エラーが発生しました。';
            }
            
            submitBtn.disabled = false;
            submitBtn.textContent = '報告を送信';
        })
        .catch(error => {
            loading.style.display = 'none';
            result.style.display = 'block';
            result.className = 'result error';
            resultMessage.textContent = 'エラーが発生しました: ' + error.message;
            
            submitBtn.disabled = false;
            submitBtn.textContent = '報告を送信';
        });
});

function validateForm() {
    const requiredCheckboxes = document.querySelectorAll('input[type="checkbox"][data-required="true"]');
    const reporterName = document.getElementById('reporterName').value.trim();
    const errors = [];
    
    // 記載者名のチェック
    if (!reporterName) {
        errors.push('記載者名を入力してください');
    }
    
    // 必須チェックボックスのチェック
    requiredCheckboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            const labelText = checkbox.closest('label').textContent.replace(/\s*\*.*$/, '').trim();
            errors.push(`「${labelText}」にチェックが入っていません`);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

function showValidationError(errors) {
    const validationError = document.getElementById('validationError');
    validationError.innerHTML = '<strong>以下の必須項目を確認してください：</strong><br>' + 
        errors.map(error => `• ${error}`).join('<br>');
    validationError.style.display = 'block';
    
    // エラー表示位置までスクロール
    validationError.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function sendToGoogleSheets(date, reporterName, checklistValues) {
    try {
        // Google Sheets APIを使用してデータを送信
        const headers = [
            '報告日時', '報告者名',
            ...allChecklistItems
        ];
        
        const values = [
            date.toLocaleString('ja-JP'),
            reporterName,
            ...checklistValues
        ];
        
        // ここでGoogle Sheets APIを呼び出します
        // 実際のAPI呼び出しは後で実装します
        console.log('送信データ:', { headers, values });
        
        // 一時的にダミーの成功レスポンスを返す
        return { success: true };
        
    } catch (error) {
        console.error('Google Sheets送信エラー:', error);
        throw error;
    }
}
