// Webhook版のJavaScript - GitHubで使用
// YOUR_WEBHOOK_URL_HEREの部分だけ変更してください

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzr685ARJtAg6jgiXpgqcTRCp21p7uT7eopWmTuJkIz-Xunmr1GQ3uaFGpilW9sRSUy/exec'; // Webhook URL設定完了

// 全チェック項目リスト
const allChecklistItems = [
    "ポストチェック",
    "郵便物あり", 
    "エレベーター点検日チェック",
    "LINEで報告_エレベーター点検日",
    "キーボックスチェック",
    "予備キーで補填",
    "LINEで報告_キーなし",
    "回収ゴミ撮影",
    "マイク充電",
    "忘れ物チェック",
    "忘れ物あり",
    "詰まりチェック",
    "LINEで報告_詰まり",
    "手洗い台",
    "便座",
    "便器",
    "床_トイレ",
    "汚物入れ袋交換",
    "洗浄",
    "冷蔵庫",
    "レンジ",
    "ケトル",
    "食器",
    "カトラリー等",
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
    "家具整頓",
    "備品整頓",
    "ハンドソープ",
    "中性洗剤",
    "トイレットペーパー",
    "ティッシュ",
    "床シート",
    "ゴミ袋",
    "LINEで報告_消耗品",
    "洗浄_布巾",
    "干す",
    "シンク洗い",
    "排水溝洗い",
    "シンク周り拭きあげ",
    "清掃ゴミまとめ",
    "掃除機のカップ",
    "特記事項あり",
    "LINEで報告_特記事項",
    "照明色調整",
    "窓閉める",
    "ロールスクリーン上げる",
    "エアコン設定",
    "写真アップロード",
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
    
    const submittedChecklist = new Set(checkedItems);
    const checklistValues = allChecklistItems.map(item => submittedChecklist.has(item));
    
    // Webhookに送信
    sendToWebhook({
        reporterName: reporterName,
        checklistItems: allChecklistItems,
        checklistValues: checklistValues
    })
    .then(response => {
        loading.style.display = 'none';
        result.style.display = 'block';
        
        if (response.success) {
            result.className = 'result success';
            resultMessage.textContent = '報告が完了しました。';
            document.getElementById('cleaningForm').reset();
        } else {
            result.className = 'result error';
            resultMessage.textContent = 'エラーが発生しました。';
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

async function sendToWebhook(data) {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // no-corsモードでは結果を確認できないので、成功とみなす
        return { success: true };
        
    } catch (error) {
        console.error('Webhook送信エラー:', error);
        throw error;
    }
}
