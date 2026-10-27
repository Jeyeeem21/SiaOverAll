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
            background: transparent;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            margin: 0;
        }
        .preview-container {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            max-width: 600px;
            width: 100%;
        }
        .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #f0f0f0;
        }
        .preview-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }
        .edit-button {
            padding: 8px 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s;
        }
        .edit-button:hover {
            background: #5568d3;
        }
        .cards-wrapper {
            display: flex;
            gap: 15px;
            justify-content: center;
            align-items: flex-start;
            flex-wrap: nowrap;
        }
        .card-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .card-label {
            font-size: 11px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
            letter-spacing: 1.2px;
            text-transform: uppercase;
        }
        .id-card {
            width: 260px;
            height: 360px;
            background: #1e5956 !important;
            border-radius: 10px;
            color: white;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .card-content {
            position: relative;
            z-index: 1;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        /* FRONT CARD STYLES */
        .card-header {
            background: #1e5956 !important;
            padding: 8px 10px 6px 10px;
            display: flex;
            align-items: flex-start;
            gap: 8px;
            position: relative;
        }
        .logo-section {
            flex-shrink: 0;
            position: relative;
        }
        .card-id-title {
            background: #1e5956 !important;
            padding: 6px 12px 8px 12px;
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 1.2px;
            color: white;
            text-align: left;
        }
        .university-logo {
            width: 45px;
            height: 45px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: visible;
            border: 2px solid #2a5f5c;
        }
        .logo-rays {
            position: absolute;
            width: 100%;
            height: 100%;
            background: 
                linear-gradient(0deg, transparent 45%, #FFD700 45%, #FFD700 55%, transparent 55%),
                linear-gradient(45deg, transparent 45%, #FFD700 45%, #FFD700 55%, transparent 55%),
                linear-gradient(90deg, transparent 45%, #FFD700 45%, #FFD700 55%, transparent 55%),
                linear-gradient(135deg, transparent 45%, #FFD700 45%, #FFD700 55%, transparent 55%);
            border-radius: 50%;
        }
        .logo-center {
            position: absolute;
            width: 20px;
            height: 24px;
            background: linear-gradient(180deg, #8B0000 0%, #600000 100%);
            border-radius: 2px;
            z-index: 3;
            box-shadow: inset 0 0 3px rgba(0,0,0,0.5);
        }
        .logo-text {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
        }
        .logo-text::before {
            content: 'MINDORO STATE UNIVERSITY';
            position: absolute;
            width: 140%;
            height: 140%;
            font-size: 3.5px;
            font-weight: bold;
            color: #1e5956;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: none;
        }
        .header-text {
            flex: 1;
        }
        .university-name {
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 2.5px;
            margin-bottom: 1px;
            line-height: 1;
            color: white;
        }
        .university-location {
            font-size: 7px;
            opacity: 0.95;
            letter-spacing: 1px;
            margin-bottom: 0;
            margin-top: 2px;
            color: white;
        }
        .card-title {
            display: none;
        }
        .card-body {
            display: flex;
            gap: 12px;
            padding: 12px 12px 16px 12px;
            align-items: flex-start;
            flex: 1;
            background: #1e5956 !important;
            position: relative;
        }
        .photo-section {
            flex-shrink: 0;
            position: relative;
        }
        .photo-pole {
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 2.5px;
            height: 10px;
            background: #FFD700;
            z-index: 10;
        }
        .photo {
            width: 80px;
            height: 100px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border: 4px solid #FFD700;
            position: relative;
        }
        .photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .photo-placeholder {
            font-size: 9px;
            color: #999;
            text-align: center;
            padding: 8px;
        }
        .info-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-width: 0;
        }
        .student-name {
            margin-bottom: 0;
        }
        .last-name {
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 2px;
            line-height: 1;
            margin-bottom: 4px;
            color: white;
        }
        .first-name {
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 1px;
            line-height: 1.2;
            padding-bottom: 5px;
            border-bottom: 4px solid #FFD700;
            margin-bottom: 8px;
            color: white;
        }
        .program {
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 1.5px;
            margin-top: 8px;
            color: white;
        }
        .card-footer {
            background: #0a2625;
            padding: 8px 12px 8px 20px;
            margin-top: auto;
            position: relative;
        }
        .card-footer::before {
            content: '';
            position: absolute;
            left: 8px;
            top: 8px;
            bottom: 8px;
            width: 3px;
            background: white;
        }
        .footer-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            align-items: baseline;
            padding-left: 8px;
        }
        .footer-row:last-child {
            margin-bottom: 0;
        }
        .footer-label {
            font-size: 7.5px;
            font-weight: bold;
            letter-spacing: 1px;
            color: #87CEEB;
        }
        .footer-value {
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 1.2px;
            color: white;
        }
        .signature-section {
            margin-top: 6px;
            padding-top: 10px;
            padding-bottom: 10px;
            text-align: center;
            background: #e8e5d8;
            border-bottom: 3.5px solid #FFD700;
        }
        .signature-line {
            font-size: 7px;
            opacity: 0.9;
            margin-bottom: 4px;
            color: #333;
        }
        .president-name {
            font-size: 9px;
            font-weight: bold;
            margin-bottom: 1px;
            color: #000;
        }
        .president-title {
            font-size: 6.5px;
            opacity: 0.85;
            color: #333;
        }
        .campus-locations {
            background: #1e5956;
            padding: 5px 8px;
            font-size: 5.5px;
            text-align: center;
            line-height: 1.5;
            opacity: 0.95;
            color: #87CEEB;
        }

        /* BACK CARD STYLES */
        .id-card-back {
            background: white !important;
            color: #333;
            height: 360px;
        }
        .back-content {
            padding: 12px;
            font-size: 7.5px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .back-field {
            margin-bottom: 8px;
        }
        .back-label {
            font-weight: bold;
            font-size: 6px;
            color: #666;
            margin-bottom: 1px;
        }
        .back-value {
            font-size: 7.5px;
            color: #000;
            font-weight: 600;
        }
        .emergency-section {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1.5px solid #f0f0f0;
        }
        .emergency-title {
            font-size: 6px;
            font-style: italic;
            color: #666;
            margin-bottom: 5px;
        }
        .signature-area {
            margin-top: 8px;
            text-align: center;
            position: relative;
            padding-bottom: 15px;
            min-height: 30px;
        }
        .signature-img {
            max-height: 24px;
            max-width: 90px;
            display: block;
            margin: 0 auto;
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 2;
        }
        .signature-label {
            font-size: 5px;
            color: #666;
            border-top: 1px solid #333;
            padding-top: 2px;
            display: block;
            width: 90px;
            margin: 0 auto;
            text-align: center;
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
        }
        .warning-box {
            background: #f8f8f8;
            border: 1.5px solid #333;
            padding: 5px;
            margin-top: 8px;
            font-size: 5px;
            text-align: center;
            line-height: 1.3;
        }
        .registrar-section {
            margin-top: 6px;
            text-align: center;
            font-size: 6.5px;
            font-weight: bold;
        }
        .registrar-signature {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 22px;
            margin-bottom: 1px;
        }
        .registrar-signature svg {
            opacity: 0.9;
        }
        .registrar-name {
            font-size: 7px;
            margin-bottom: 1px;
            font-weight: bold;
        }
        .registrar-title {
            font-size: 5px;
            color: #666;
            font-weight: normal;
        }
        .validation-section {
            margin-top: 8px;
            padding-top: 6px;
            border-top: 1px solid #ddd;
        }
        .validation-label {
            font-size: 5.5px;
            font-weight: bold;
            margin-bottom: 3px;
        }
        .validation-table {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 1px;
            margin-bottom: 4px;
        }
        .validation-cell {
            border: 1px solid #333;
            padding: 2px 1px;
            text-align: center;
            font-size: 4.5px;
            min-height: 12px;
        }
        .validation-year {
            font-weight: bold;
            background: #f0f0f0;
        }
        .barcode {
            text-align: center;
            margin-top: 6px;
        }
        .barcode-lines {
            display: flex;
            justify-content: center;
            gap: 0.5px;
            margin-bottom: 2px;
        }
        .barcode-line {
            width: 1px;
            height: 18px;
            background: #000;
        }
        .barcode-line.wide {
            width: 2px;
        }
        .barcode-text {
            font-size: 6px;
            font-weight: bold;
            letter-spacing: 0.6px;
        }
        
        .status-badge {
            display: none;
        }
        .action-buttons {
            display: none;
        }
        
        /* Edit Form Styles */
        .edit-mode {
            padding: 10px 0;
        }
        .edit-form {
            max-height: 500px;
            overflow-y: auto;
        }
        .form-section {
            margin-bottom: 24px;
        }
        .form-section h3 {
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid #f0f0f0;
        }
        .form-group {
            margin-bottom: 12px;
        }
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        .form-group label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            color: #555;
            margin-bottom: 4px;
        }
        .form-input {
            width: 100%;
            padding: 8px 12px;
            border: 1.5px solid #ddd;
            border-radius: 6px;
            font-size: 13px;
            font-family: 'Arial', sans-serif;
            transition: border-color 0.2s;
        }
        .form-input:focus {
            outline: none;
            border-color: #667eea;
        }
        textarea.form-input {
            resize: vertical;
            min-height: 60px;
        }
        .form-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
        }
        .btn {
            padding: 10px 24px;
            border-radius: 6px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 13px;
        }
        .btn-cancel {
            background: #f5f5f5;
            color: #666;
        }
        .btn-cancel:hover {
            background: #e8e8e8;
        }
        .btn-save {
            background: #667eea;
            color: white;
        }
        .btn-save:hover {
            background: #5568d3;
        }
        
        @media print {
            body {
                background: white;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color-adjust: exact;
            }
            .preview-container {
                box-shadow: none;
                padding: 0;
            }
            .preview-header, .action-buttons, .status-badge, .edit-button {
                display: none !important;
            }
            /* Force print backgrounds and colors */
            .id-card,
            .id-card-back,
            .card-header,
            .card-body,
            .card-id-title,
            .card-footer,
            .signature-section,
            .campus-locations,
            .back-content,
            .warning-box,
            .validation-year {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            .id-card {
                background: #1e5956 !important;
            }
            .id-card-back {
                background: white !important;
            }
            .back-content {
                background: transparent !important;
            }
            .card-header {
                background: #1e5956 !important;
            }
            .card-body {
                background: #1e5956 !important;
            }
            .card-id-title {
                background: #1e5956 !important;
            }
            .card-footer {
                background: #0a2625 !important;
            }
            .signature-section {
                background: #e8e5d8 !important;
            }
            .campus-locations {
                background: #1e5956 !important;
            }
            .warning-box {
                background: #f8f8f8 !important;
                border: 1.5px solid #333 !important;
            }
            .validation-year {
                background: #f0f0f0 !important;
            }
            .validation-cell {
                border: 1px solid #333 !important;
            }
            .barcode-line {
                background: #000 !important;
            }
            /* Force print border colors */
            .photo {
                border: 4px solid #FFD700 !important;
            }
            .first-name {
                border-bottom: 4px solid #FFD700 !important;
            }
            .signature-section {
                border-bottom: 3.5px solid #FFD700 !important;
            }
            .photo-pole {
                background: #FFD700 !important;
            }
        }
    </style>
</head>
<body>
    <div class="preview-container">
        <div class="preview-header">
            <h1 class="preview-title">Student ID Card Preview</h1>
            <button class="edit-button" onclick="toggleEditMode()">Edit</button>
        </div>

        <div class="cards-wrapper" id="viewMode">
            <!-- FRONT OF CARD -->
            <div class="card-wrapper">
                <div class="card-label">FRONT</div>
                <div class="id-card">
                    <div class="card-content">
                        <div class="card-header">
                            <div class="logo-section">
                                <div class="university-logo">
                                    <div class="logo-rays"></div>
                                    <div class="logo-center"></div>
                                    <div class="logo-text"></div>
                                </div>
                            </div>
                            <div class="header-text">
                                <div class="university-name">MINDORO STATE UNIVERSITY</div>
                                <div class="university-location">ORIENTAL MINDORO, PHILIPPINES 5211</div>
                            </div>
                        </div>
                        
                        <div class="card-id-title">STUDENT IDENTIFICATION CARD</div>

                        <div class="card-body">
                            <div class="photo-section">
                                <div class="photo-pole"></div>
                                <div class="photo" id="photoPreview">
                                    <?php if($student->photo_path): ?>
                                        <img src="<?php echo e($student->photo_url); ?>" alt="<?php echo e($student->full_name); ?>">
                                    <?php else: ?>
                                        <div class="photo-placeholder">No Photo</div>
                                    <?php endif; ?>
                                </div>
                            </div>

                            <div class="info-section">
                                <div class="student-name">
                                    <div class="last-name" id="lastNameDisplay"><?php echo e(strtoupper($student->last_name)); ?></div>
                                    <div class="first-name" id="firstNameDisplay"><?php echo e(strtoupper($student->first_name)); ?> <?php echo e(strtoupper(substr($student->middle_name ?? '', 0, 1))); ?>.</div>
                                </div>
                                <div class="program" id="programDisplay"><?php echo e(strtoupper($student->program)); ?></div>
                            </div>
                        </div>

                        <div class="card-footer">
                            <div class="footer-row">
                                <div class="footer-label">STUDENT ID NUMBER</div>
                                <div class="footer-value" id="idNumberDisplay"><?php echo e($student->student_id_number); ?></div>
                            </div>
                            <div class="footer-row">
                                <div class="footer-label">ISSUED</div>
                                <div class="footer-value" id="issuedDisplay">AY <?php echo e(now()->format('Y')); ?>-<?php echo e(now()->addYear()->format('Y')); ?></div>
                            </div>
                        </div>

                        <div class="signature-section">
                            <div class="signature-line">_________________________</div>
                            <div class="president-name">LEVY B. ARAGO, LPT, PhD</div>
                            <div class="president-title">University President</div>
                        </div>

                        <div class="campus-locations">
                            MAIN CAMPUS, Alcate, Victoria<br>
                            BONGABONG CAMPUS, Labasan, Bongabong
                        </div>
                    </div>
                </div>
            </div>

            <!-- BACK OF CARD -->
            <div class="card-wrapper back-card">
                <div class="card-label">BACK</div>
                <div class="id-card id-card-back">
                    <div class="back-content">
                        <div class="back-field">
                            <div class="back-label">Address:</div>
                            <div class="back-value" id="addressDisplay"><?php echo e($student->address ?: 'Not Provided'); ?></div>
                        </div>
                        
                        <div class="back-field">
                            <div class="back-label">Birthday:</div>
                            <div class="back-value" id="birthdateDisplay"><?php echo e($student->birthdate ? $student->birthdate->format('F d, Y') : 'Not Provided'); ?></div>
                        </div>
                        
                        <div class="emergency-section">
                            <div class="emergency-title">Person to notify in case of emergency</div>
                            <div class="back-field">
                                <div class="back-value" id="emergencyNameDisplay"><?php echo e($student->emergency_contact_name ?: 'Not Provided'); ?></div>
                            </div>
                            <div class="back-field">
                                <div class="back-label">Tel./Cell.No.</div>
                                <div class="back-value" id="emergencyNumberDisplay"><?php echo e($student->emergency_contact_number ?: 'Not Provided'); ?></div>
                            </div>
                        </div>

                        <div class="signature-area">
                            <?php if($student->signature_path): ?>
                                <img src="<?php echo e($student->signature_url); ?>" alt="Signature" class="signature-img" id="signaturePreview">
                            <?php else: ?>
                                <div style="height: 24px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 7px;" id="signaturePreview">
                                    No Signature
                                </div>
                            <?php endif; ?>
                            <div class="signature-label">Cardholder's Signature</div>
                        </div>

                        <div class="warning-box">
                            This ID card is non-transferable.<br>
                            Tampering it in any way will invalidate this<br>
                            card. This must be worn at all time when in<br>
                            campus. If lost and found, please surrender<br>
                            to MinSU immediately.
                        </div>

                        <div class="registrar-section">
                            <div class="registrar-signature">
                                <!-- Registrar's e-signature -->
                                <div id="registrarSignatureDisplay" style="height: 18px; margin-bottom: 2px; display: flex; align-items: center; justify-content: center;">
                                    <?php if($student->registrar_signature_path): ?>
                                        <img src="<?php echo e($student->registrar_signature_url); ?>" alt="Registrar Signature" style="max-height: 18px; max-width: 80px;">
                                    <?php else: ?>
                                        <span style="font-family: 'Brush Script MT', cursive; font-size: 14px; font-style: italic; color: #000;">Rachel M. Dela Cruz</span>
                                    <?php endif; ?>
                                </div>
                            </div>
                            <div class="registrar-name">RACHEL MARIE N. DELA CRUZ</div>
                            <div class="registrar-title">Registrar I</div>
                        </div>

                        <div class="validation-section">
                            <div class="validation-label">Validation:</div>
                            <div class="validation-table">
                                <?php
                                    $currentYear = now()->year;
                                    $startYear = $currentYear - 1;
                                ?>
                                <?php for($i = 0; $i < 5; $i++): ?>
                                    <?php
                                        $year1 = $startYear + $i;
                                        $year2 = $year1 + 1;
                                    ?>
                                    <div class="validation-cell validation-year"><?php echo e($year1); ?>-<?php echo e($year2); ?></div>
                                <?php endfor; ?>
                                <?php for($i = 0; $i < 5; $i++): ?>
                                    <div class="validation-cell">
                                        <?php if($i === 0): ?>
                                            ✓
                                        <?php endif; ?>
                                    </div>
                                <?php endfor; ?>
                            </div>
                        </div>

                        <div class="barcode">
                            <div class="barcode-lines">
                                <?php for($i = 0; $i < 30; $i++): ?>
                                    <div class="barcode-line <?php echo e($i % 3 === 0 ? 'wide' : ''); ?>"></div>
                                <?php endfor; ?>
                            </div>
                            <div class="barcode-text"><?php echo e($card->card_number); ?></div>
                        </div>
                    </div>
                </div>
            </div>

            </div>
        </div>

        <div class="edit-mode" id="editMode" style="display: none;">
            <form id="editForm" class="edit-form">
                <div class="form-section">
                    <h3>Personal Information</h3>
                    <div class="form-group">
                        <label>Last Name</label>
                        <input type="text" id="lastName" value="<?php echo e($student->last_name); ?>" class="form-input">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>First Name</label>
                            <input type="text" id="firstName" value="<?php echo e($student->first_name); ?>" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Middle Initial</label>
                            <input type="text" id="middleName" value="<?php echo e($student->middle_name); ?>" class="form-input" maxlength="1">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Program</label>
                        <input type="text" id="program" value="<?php echo e($student->program); ?>" class="form-input">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Student ID Number</label>
                            <input type="text" id="idNumber" value="<?php echo e($student->student_id_number); ?>" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Birthdate</label>
                            <input type="date" id="birthdate" value="<?php echo e($student->birthdate ? $student->birthdate->format('Y-m-d') : ''); ?>" class="form-input">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Address</label>
                        <textarea id="address" class="form-input" rows="2"><?php echo e($student->address); ?></textarea>
                    </div>
                </div>

                <div class="form-section">
                    <h3>Emergency Contact</h3>
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="emergencyName" value="<?php echo e($student->emergency_contact_name); ?>" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Contact Number</label>
                        <input type="text" id="emergencyNumber" value="<?php echo e($student->emergency_contact_number); ?>" class="form-input">
                    </div>
                </div>

                <div class="form-section">
                    <h3>Signatures</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Cardholder's Signature</label>
                            <input type="file" id="signatureUpload" accept="image/*" class="form-input" onchange="previewSignature(event)">
                            <small style="font-size: 10px; color: #666;">Student's signature</small>
                        </div>
                        <div class="form-group">
                            <label>Registrar's Signature</label>
                            <input type="file" id="registrarSignatureUpload" accept="image/*" class="form-input" onchange="previewRegistrarSignature(event)">
                            <small style="font-size: 10px; color: #666;">Registrar's signature</small>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3>Photos</h3>
                    <div class="form-group">
                        <label>Student Photo</label>
                        <input type="file" id="photoUpload" accept="image/*" class="form-input" onchange="previewPhoto(event)">
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-cancel" onclick="toggleEditMode()">Cancel</button>
                    <button type="button" class="btn btn-save" onclick="saveChanges()">Save Changes</button>
                </div>
            </form>
        </div>

        <div style="text-align: center; display: none;">
            <span class="status-badge status-<?php echo e($card->status); ?>">
                <?php echo e(ucfirst($card->status)); ?>

            </span>
        </div>

        <div class="action-buttons" style="display: none;">
            <a href="<?php echo e(route('student-id-cards.pdf', $card)); ?>" class="btn btn-primary">
                Download PDF
            </a>
            <button onclick="window.print()" class="btn btn-secondary">
                Print
            </button>
        </div>
    </div>

    <script>
        function toggleEditMode() {
            const viewMode = document.getElementById('viewMode');
            const editMode = document.getElementById('editMode');
            const editButton = document.querySelector('.edit-button');
            
            if (viewMode.style.display === 'none') {
                viewMode.style.display = 'flex';
                editMode.style.display = 'none';
                editButton.textContent = 'Edit';
            } else {
                viewMode.style.display = 'none';
                editMode.style.display = 'block';
                editButton.textContent = 'View Card';
            }
        }

        function previewPhoto(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const photoPreview = document.getElementById('photoPreview');
                    photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;">`;
                }
                reader.readAsDataURL(file);
            }
        }

        function previewSignature(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const signaturePreview = document.getElementById('signaturePreview');
                    signaturePreview.innerHTML = `<img src="${e.target.result}" alt="Signature" class="signature-img" style="max-height: 24px; max-width: 90px;">`;
                }
                reader.readAsDataURL(file);
            }
        }

        function previewRegistrarSignature(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const registrarSignatureDisplay = document.getElementById('registrarSignatureDisplay');
                    registrarSignatureDisplay.innerHTML = `<img src="${e.target.result}" alt="Registrar Signature" style="max-height: 18px; max-width: 80px;">`;
                }
                reader.readAsDataURL(file);
            }
        }

        async function saveChanges() {
            const studentId = <?php echo e($student->id); ?>;
            const formData = new FormData();
            
            // Add text fields
            formData.append('first_name', document.getElementById('firstName').value);
            formData.append('last_name', document.getElementById('lastName').value);
            formData.append('middle_name', document.getElementById('middleName').value);
            formData.append('program', document.getElementById('program').value);
            formData.append('student_id_number', document.getElementById('idNumber').value);
            formData.append('birthdate', document.getElementById('birthdate').value);
            formData.append('address', document.getElementById('address').value);
            formData.append('emergency_contact_name', document.getElementById('emergencyName').value);
            formData.append('emergency_contact_number', document.getElementById('emergencyNumber').value);
            
            // Add photo if uploaded
            const photoFile = document.getElementById('photoUpload').files[0];
            if (photoFile) {
                formData.append('photo', photoFile);
            }
            
            // Add signature if uploaded
            const signatureFile = document.getElementById('signatureUpload').files[0];
            if (signatureFile) {
                formData.append('signature', signatureFile);
            }
            
            // Add registrar signature if uploaded
            const registrarSignatureFile = document.getElementById('registrarSignatureUpload').files[0];
            if (registrarSignatureFile) {
                formData.append('registrar_signature', registrarSignatureFile);
            }
            
            // Add method override for PATCH request
            formData.append('_method', 'PATCH');
            
            try {
                const response = await fetch(`http://localhost:8000/api/students/${studentId}`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to save changes');
                }
                
                const data = await response.json();
                
                // Update displayed values
                document.getElementById('lastNameDisplay').textContent = data.data.last_name.toUpperCase();
                document.getElementById('firstNameDisplay').textContent = data.data.first_name.toUpperCase() + ' ' + 
                    (data.data.middle_name ? data.data.middle_name.charAt(0).toUpperCase() + '.' : '');
                document.getElementById('programDisplay').textContent = data.data.program.toUpperCase();
                document.getElementById('idNumberDisplay').textContent = data.data.student_id_number;
                document.getElementById('addressDisplay').textContent = data.data.address || 'Not Provided';
                
                if (data.data.birthdate) {
                    const date = new Date(data.data.birthdate);
                    document.getElementById('birthdateDisplay').textContent = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                }
                
                document.getElementById('emergencyNameDisplay').textContent = data.data.emergency_contact_name || 'Not Provided';
                document.getElementById('emergencyNumberDisplay').textContent = data.data.emergency_contact_number || 'Not Provided';
                
                // Update photo if changed
                if (data.data.photo_url) {
                    document.getElementById('photoPreview').innerHTML = `<img src="${data.data.photo_url}" alt="${data.data.full_name}" style="width: 100%; height: 100%; object-fit: cover;">`;
                }
                
                // Update signature if changed
                if (data.data.signature_url && document.getElementById('signaturePreview')) {
                    document.getElementById('signaturePreview').innerHTML = `<img src="${data.data.signature_url}" alt="Signature" class="signature-img" style="max-height: 24px; max-width: 90px;">`;
                }
                
                // Update registrar signature if changed
                if (data.data.registrar_signature_url && document.getElementById('registrarSignatureDisplay')) {
                    document.getElementById('registrarSignatureDisplay').innerHTML = `<img src="${data.data.registrar_signature_url}" alt="Registrar Signature" style="max-height: 18px; max-width: 80px;">`;
                }
                
                // Switch back to view mode
                toggleEditMode();
                
                alert('Changes saved successfully to database!');
                
                // Reload the page to reflect changes
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                
            } catch (error) {
                console.error('Error saving changes:', error);
                alert('Error saving changes: ' + error.message);
            }
        }
    </script>
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
<?php /**PATH C:\laragon\www\studentid\backend\resources\views/id-cards/student-preview.blade.php ENDPATH**/ ?>