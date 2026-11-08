<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student ID Card Preview - <?php echo e($student->full_name); ?></title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .preview-container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
        }
        .preview-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .preview-header h1 {
            font-size: 24px;
            color: #333;
            margin-bottom: 10px;
        }
        .preview-header p {
            color: #666;
            font-size: 14px;
        }
        .id-card {
            width: 100%;
            max-width: 400px;
            background: #1e5956;
            border-radius: 12px;
            color: white;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            position: relative;
            overflow: visible;
        }
        .card-content {
            position: relative;
            z-index: 1;
        }
        /* Header Section */
        .card-header {
            background: #0f3d3a;
            padding: 14px 20px;
            text-align: center;
        }
        .university-name {
            font-size: 15px;
            font-weight: bold;
            letter-spacing: 1.5px;
            margin-bottom: 2px;
        }
        .university-location {
            font-size: 9px;
            opacity: 0.95;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        .card-title {
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 1.2px;
            margin-top: 4px;
        }
        /* Body Section */
        .card-body {
            display: flex;
            gap: 20px;
            padding: 24px;
            align-items: flex-start;
        }
        .photo-section {
            flex-shrink: 0;
        }
        .photo {
            width: 95px;
            height: 95px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border: 4px solid #FFD700;
        }
        .photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .photo-placeholder {
            font-size: 12px;
            color: #999;
            text-align: center;
            padding: 10px;
        }
        .info-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            min-width: 0;
        }
        .student-name {
            font-size: 19px;
            font-weight: bold;
            letter-spacing: 0.8px;
            line-height: 1.3;
            border-bottom: 2px solid #FFD700;
            padding-bottom: 8px;
            margin-bottom: 10px;
            word-wrap: break-word;
        }
        .program {
            font-size: 16px;
            font-weight: bold;
            letter-spacing: 0.5px;
        }
        /* Footer Section */
        .card-footer {
            background: #0a2625;
            padding: 14px 24px 12px 24px;
        }
        .footer-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            align-items: baseline;
        }
        .footer-label {
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 0.8px;
        }
        .footer-value {
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 0.8px;
        }
        .signature-section {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid rgba(255, 215, 0, 0.3);
            text-align: center;
        }
        .signature-line {
            font-size: 8px;
            opacity: 0.9;
        }
        .status-badge {
            display: inline-block;
            margin-top: 20px;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-requested {
            background: #fef3c7;
            color: #92400e;
        }
        .status-approved {
            background: #dbeafe;
            color: #1e40af;
        }
        .status-printed {
            background: #e9d5ff;
            color: #6b21a8;
        }
        .status-released {
            background: #d1fae5;
            color: #065f46;
        }
        .action-buttons {
            margin-top: 30px;
            display: flex;
            gap: 12px;
            justify-content: center;
        }
        .btn {
            padding: 12px 24px;
            border-radius: 8px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .btn-secondary {
            background: white;
            color: #333;
            border: 2px solid #ddd;
        }
        @media print {
            body {
                background: white;
            }
            .preview-container {
                box-shadow: none;
                padding: 0;
            }
            .preview-header, .action-buttons, .status-badge {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="preview-container">
        <div class="preview-header">
            <h1>Student ID Card Preview</h1>
            <p><?php echo e($student->full_name); ?></p>
        </div>

        <div class="id-card">
            <div class="card-content">
                <!-- Header -->
                <div class="card-header">
                    <div class="university-name">MINDORO STATE UNIVERSITY</div>
                    <div class="university-location">ORIENTAL MINDORO, PHILIPPINES 5211</div>
                    <div class="card-title">STUDENT IDENTIFICATION CARD</div>
                </div>

                <!-- Body -->
                <div class="card-body">
                    <div class="photo-section">
                        <div class="photo">
                            <?php if($student->photo_path): ?>
                                <img src="<?php echo e($student->photo_url); ?>" alt="<?php echo e($student->full_name); ?>">
                            <?php else: ?>
                                <div class="photo-placeholder">No Photo</div>
                            <?php endif; ?>
                        </div>
                    </div>

                    <div class="info-section">
                        <div class="student-name">
                            <?php echo e(strtoupper($student->last_name)); ?><br>
                            <?php echo e(strtoupper($student->first_name)); ?> <?php echo e(strtoupper(substr($student->middle_name ?? '', 0, 1))); ?>.
                        </div>
                        <div class="program"><?php echo e(strtoupper($student->program)); ?></div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="card-footer">
                    <div class="footer-row">
                        <div class="footer-label">STUDENT ID NUMBER</div>
                        <div class="footer-value"><?php echo e($student->student_number); ?></div>
                    </div>
                    <div class="footer-row">
                        <div class="footer-label">ISSUED</div>
                        <div class="footer-value">AY <?php echo e(now()->format('Y')); ?>-<?php echo e(now()->addYear()->format('Y')); ?></div>
                    </div>
                    <div class="signature-section">
                        <div class="signature-line">University President</div>
                    </div>
                </div>
            </div>
        </div>

        <div style="text-align: center;">
            <span class="status-badge status-<?php echo e($card->status); ?>">
                <?php echo e(ucfirst($card->status)); ?>

            </span>
        </div>

        <div class="action-buttons">
            <a href="<?php echo e(route('student-id-cards.pdf', $card)); ?>" class="btn btn-primary">
                Download PDF
            </a>
            <button onclick="window.print()" class="btn btn-secondary">
                Print
            </button>
        </div>
    </div>
</body>
</html>
<?php /**PATH C:\laragon\www\staff\backend\resources\views/id-cards/student-preview.blade.php ENDPATH**/ ?>