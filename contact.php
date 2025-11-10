<?php
/**
 * ============================================
 * お問い合わせフォーム処理ファイル
 * フォームから送信されたデータを受け取り、バリデーションとメール送信を行う
 * ============================================
 */

// レスポンスヘッダーを設定（JSON形式で返す）
header('Content-Type: application/json; charset=utf-8');

// CORS設定（必要に応じて調整）
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// POSTリクエストのみを受け付ける
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode([
        'success' => false,
        'message' => 'POSTメソッドのみサポートしています'
    ]);
    exit;
}

/**
 * ============================================
 * 入力データの取得とサニタイズ
 * ============================================
 */
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$subject = isset($_POST['subject']) ? trim($_POST['subject']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

/**
 * ============================================
 * バリデーション
 * ============================================
 */
$errors = [];

// 名前のバリデーション
if (empty($name)) {
    $errors[] = 'お名前は必須です';
} elseif (mb_strlen($name) > 100) {
    $errors[] = 'お名前は100文字以内で入力してください';
}

// メールアドレスのバリデーション
if (empty($email)) {
    $errors[] = 'メールアドレスは必須です';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = '有効なメールアドレスを入力してください';
} elseif (mb_strlen($email) > 255) {
    $errors[] = 'メールアドレスは255文字以内で入力してください';
}

// 件名のバリデーション
if (empty($subject)) {
    $errors[] = '件名は必須です';
} elseif (mb_strlen($subject) > 200) {
    $errors[] = '件名は200文字以内で入力してください';
}

// メッセージのバリデーション
if (empty($message)) {
    $errors[] = 'メッセージは必須です';
} elseif (mb_strlen($message) > 2000) {
    $errors[] = 'メッセージは2000文字以内で入力してください';
}

// バリデーションエラーがある場合はエラーレスポンスを返す
if (!empty($errors)) {
    http_response_code(400); // Bad Request
    echo json_encode([
        'success' => false,
        'message' => implode('、', $errors)
    ]);
    exit;
}

/**
 * ============================================
 * セキュリティ対策：スパム対策
 * ============================================
 */

// 簡易的なスパム対策：送信頻度制限（セッションを使用）
session_start();

// 最後の送信時刻をチェック（60秒以内の連続送信を防ぐ）
if (isset($_SESSION['last_submission_time'])) {
    $timeSinceLastSubmission = time() - $_SESSION['last_submission_time'];
    if ($timeSinceLastSubmission < 60) {
        http_response_code(429); // Too Many Requests
        echo json_encode([
            'success' => false,
            'message' => '送信が頻繁すぎます。しばらくしてからもう一度お試しください。'
        ]);
        exit;
    }
}

// 送信時刻を記録
$_SESSION['last_submission_time'] = time();

// ホニーポット（ボット対策：隠しフィールドがあればスパムと判定）
if (isset($_POST['website']) && !empty($_POST['website'])) {
    // ボットと判定して処理を停止（エラーレスポンスは返さない）
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'メッセージを送信しました'
    ]);
    exit;
}

/**
 * ============================================
 * メール送信処理
 * ============================================
 */

// メール送信先の設定（実際の環境に合わせて変更してください）
$to = 'example@example.com'; // 受信先メールアドレス
$emailSubject = '【お問い合わせ】' . $subject;

// メール本文の作成
$emailBody = "以下の内容でお問い合わせがありました。\n\n";
$emailBody .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
$emailBody .= "お名前: " . $name . "\n";
$emailBody .= "メールアドレス: " . $email . "\n";
$emailBody .= "件名: " . $subject . "\n";
$emailBody .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$emailBody .= "メッセージ:\n";
$emailBody .= $message . "\n";
$emailBody .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

// メールヘッダーの設定
$headers = [];
$headers[] = 'From: ' . mb_encode_mimeheader($name) . ' <' . $email . '>';
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'X-Mailer: PHP/' . phpversion();
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'Content-Transfer-Encoding: 8bit';

// メール送信を実行
$mailSent = @mail($to, $emailSubject, $emailBody, implode("\r\n", $headers));

/**
 * ============================================
 * 自動返信メール（オプション）
 * ============================================
 */
if ($mailSent) {
    // 送信者への自動返信メール（オプション）
    $autoReplySubject = '【自動返信】お問い合わせありがとうございます';
    $autoReplyBody = $name . " 様\n\n";
    $autoReplyBody .= "この度は、お問い合わせいただきありがとうございます。\n\n";
    $autoReplyBody .= "以下の内容でお問い合わせを受け付けました。\n";
    $autoReplyBody .= "担当者より、3営業日以内にご返信させていただきます。\n\n";
    $autoReplyBody .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    $autoReplyBody .= "【お問い合わせ内容】\n\n";
    $autoReplyBody .= "件名: " . $subject . "\n\n";
    $autoReplyBody .= "メッセージ:\n";
    $autoReplyBody .= $message . "\n";
    $autoReplyBody .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    $autoReplyBody .= "今後ともよろしくお願いいたします。\n";
    
    $autoReplyHeaders = [];
    $autoReplyHeaders[] = 'From: ' . mb_encode_mimeheader('Portfolio Site') . ' <' . $to . '>';
    $autoReplyHeaders[] = 'X-Mailer: PHP/' . phpversion();
    $autoReplyHeaders[] = 'Content-Type: text/plain; charset=UTF-8';
    $autoReplyHeaders[] = 'Content-Transfer-Encoding: 8bit';
    
    // 自動返信メールを送信（エラーは無視）
    @mail($email, $autoReplySubject, $autoReplyBody, implode("\r\n", $autoReplyHeaders));
}

/**
 * ============================================
 * データベースへの保存（オプション）
 * ============================================
 */
// 必要に応じて、データベースに保存する処理を追加
// 例：MySQL、PostgreSQL、SQLiteなど

/**
 * ============================================
 * レスポンスの返却
 * ============================================
 */
if ($mailSent) {
    // 成功レスポンス
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'お問い合わせありがとうございます。メッセージを送信しました。'
    ]);
} else {
    // メール送信失敗
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'success' => false,
        'message' => 'メール送信に失敗しました。しばらくしてからもう一度お試しください。'
    ]);
}

/**
 * ============================================
 * ログ記録（オプション）
 * ============================================
 */
// 必要に応じて、ログファイルに記録
$logMessage = date('Y-m-d H:i:s') . " - Contact form submission from: " . $email . " - " . ($mailSent ? "Success" : "Failed") . "\n";
@file_put_contents('contact_log.txt', $logMessage, FILE_APPEND);

exit;
?>



