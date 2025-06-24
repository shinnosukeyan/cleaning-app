const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbw-0rDjj0c7BAq3KaoXkzIY9BCjgwgJNDBi0iILHtdg26g1a3svq0BvvWSogoNL6Gp3SA/exec';

const allItems = [
    "ポストチェック", "郵便物あり", "エレベーター点検日チェック", "LINEで報告_エレベーター点検日",
    "キーボックスチェック", "予備キーで補填", "LINEで報告_キーなし", "回収ゴミ撮影",
    "マイク充電", "忘れ物チェック", "忘れ物あり", "詰まりチェック", "LINEで報告_詰まり",
    "手洗い台", "便座", "便器", "床_トイレ", "汚物入れ袋交換", "洗浄", "冷蔵庫", 
    "レンジ", "ケトル", "食器", "カトラリー等", "掃き掃除_テーブル", "拭き掃除_テーブル",
    "乾拭き_テーブル", "掃き掃除_イス", "拭き掃除_イス", "掃き掃除_ソファー", "拭き掃除_ソファー",
    "家具をズラす", "掃き_床", "拭き_床", "家具整頓", "備品整頓", "ハンドソープ", "中性洗剤",
    "トイレットペーパー", "ティッシュ", "床シート", "ゴミ袋", "LINEで報告_消耗品",
    "洗浄_布巾", "干す", "シンク洗い", "排水溝洗い", "シンク周り拭きあげ", "清掃ゴミまとめ",
    "掃除機のカップ", "特記事項あり", "LINEで報告_特記事項", "照明色調整", "窓閉める",
    "ロールスクリーン上げる", "エアコン設定", "写真アップロード", "換気扇オン_奥",
    "換気扇オフ_手前", "照明オフ", "キッチン照明オン", "戸締り", "清掃ゴミ出し", "回収ゴミ出し"
];

document.getElementById('cleaningForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
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
    
    validationError.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';
    loading.style.display = 'block';
    result.style.display = 'none';
    
    const formData = new FormData(this);
    const reporterName = formData.get('reporterName');
    const checkedItems = formData.getAll('checklist');
    
    sendData(reporterName, checkedItems)
    .then(() => {
        loading.style.display = 'none';
        result.style.display = 'block';
        result.className = 'result success';
        resultMessage.textContent = '報告が完了しました。';
        document.getElementById('cleaningForm').reset();
        
        submitBtn.disabled = false;
        submitBtn.textContent = '報告を送信';
    });
});

function validateForm() {
    const requiredCheckboxes = document.querySelectorAll('input[type="checkbox"][data-required="true"]');
    const reporterName = document.getElementById('reporterName').value.trim();
    const errors = [];
    
    if (!reporterName) {
        errors.push('記載者名を入力してください');
    }
    
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
    validationError.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function sendData(reporterName, checkedItems) {
    const formData = new FormData();
    formData.append('reporterName', reporterName);
    
    // 各チェック項目をtrue/falseで送信
    allItems.forEach(item => {
        formData.append(item, checkedItems.includes(item) ? 'true' : 'false');
    });
    
    await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData
    });
}
