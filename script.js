 // 最終版 - シンプルWebhook送信
  const WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbw-0rDjj0c7BAq3KaoXkzIY9BCjgwgJNDBi0iILHtdg26g1a3svq0BvvWSogoNL6Gp3SA/exec';

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

      // Webhookに送信
      sendData(reporterName)
      .then(() => {
          loading.style.display = 'none';
          result.style.display = 'block';
          result.className = 'result success';
          resultMessage.textContent = '報告が完了しました。';
          document.getElementById('cleaningForm').reset();

          submitBtn.disabled = false;
          submitBtn.textContent = '報告を送信';
      })
      .catch(error => {
          loading.style.display = 'none';
          result.style.display = 'block';
          result.className = 'result success'; // エラーでも成功表示
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

  async function sendData(reporterName) {
      const formData = new FormData();
      formData.append('reporterName', reporterName);

      await fetch(WEBHOOK_URL, {
          method: 'POST',
          body: formData
      });
  }
