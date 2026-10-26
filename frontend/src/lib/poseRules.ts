import { LandmarkPoint, calculateAngle, calculateVerticalAngle, getMidpoint } from './angles';

export interface PoseEvaluation {
  isCorrect: boolean;
  accuracy: number; // 0 to 100
  feedback: string;
  primaryAngle: number;
  angles: Record<string, number>;
  rawDebug?: Record<string, any>;
}

export function evaluateTadasana(landmarks: LandmarkPoint[]): PoseEvaluation {
  if (!landmarks || landmarks.length < 33) {
    return {
      isCorrect: false,
      accuracy: 0,
      feedback: 'Camera ke samne poora shareer laayein.',
      primaryAngle: 0,
      angles: {},
    };
  }

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

  const midShoulders = getMidpoint(leftShoulder, rightShoulder);
  const midHips = getMidpoint(leftHip, rightHip);
  const spineTilt = calculateVerticalAngle(midShoulders, midHips);

  const angles = {
    left_knee: leftKneeAngle,
    right_knee: rightKneeAngle,
    spine_tilt: spineTilt,
  };

  let feedback = 'Perfect! Aise hi bane rahein.';
  let isCorrect = true;
  let penalty = 0;

  if (leftKneeAngle < 160) {
    feedback = 'Baayein ghutne ko thoda seedha karein.';
    isCorrect = false;
    penalty += Math.min(30, (160 - leftKneeAngle) * 2);
  } else if (rightKneeAngle < 160) {
    feedback = 'Daayein ghutne ko thoda seedha karein.';
    isCorrect = false;
    penalty += Math.min(30, (160 - rightKneeAngle) * 2);
  } else if (spineTilt > 14) {
    feedback = 'Peeth aur gardan ko seedha rakhein, jhukein nahi.';
    isCorrect = false;
    penalty += Math.min(30, (spineTilt - 14) * 3);
  }

  const accuracy = Math.max(0, Math.min(100, Math.round(100 - penalty)));
  const primaryAngle = Math.round(((leftKneeAngle + rightKneeAngle) / 2) * 10) / 10;

  return {
    isCorrect,
    accuracy,
    feedback,
    primaryAngle,
    angles,
    rawDebug: {
      leftKneeAngle,
      rightKneeAngle,
      spineTilt,
      shoulderVis: Math.min(leftShoulder.visibility || 0, rightShoulder.visibility || 0),
    },
  };
}

export function evaluateVrikshasana(landmarks: LandmarkPoint[]): PoseEvaluation {
  if (!landmarks || landmarks.length < 33) {
    return {
      isCorrect: false,
      accuracy: 0,
      feedback: 'Camera ke samne poora shareer laayein.',
      primaryAngle: 0,
      angles: {},
    };
  }

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

  const midShoulders = getMidpoint(leftShoulder, rightShoulder);
  const midHips = getMidpoint(leftHip, rightHip);
  const spineTilt = calculateVerticalAngle(midShoulders, midHips);

  // Determine which leg is standing and which is bent
  const isLeftStanding = leftKneeAngle > rightKneeAngle;
  const standingAngle = isLeftStanding ? leftKneeAngle : rightKneeAngle;
  const bentAngle = isLeftStanding ? rightKneeAngle : leftKneeAngle;

  const angles = {
    standing_leg: standingAngle,
    bent_leg: bentAngle,
    spine_tilt: spineTilt,
  };

  let feedback = 'Shabash! Santulan banaye rakhein.';
  let isCorrect = true;
  let penalty = 0;

  if (standingAngle < 155) {
    feedback = 'Khadhe pair ke ghutne ko seedha aur mazboot rakhein.';
    isCorrect = false;
    penalty += Math.min(30, (155 - standingAngle) * 2);
  } else if (bentAngle > 95 || bentAngle < 30) {
    feedback = 'Mode hue pair ke ghutne ko bahar ki or kholein.';
    isCorrect = false;
    penalty += 25;
  } else if (spineTilt > 15) {
    feedback = 'Shareer ko seedha rakhein, ek taraf jhukne na dein.';
    isCorrect = false;
    penalty += Math.min(25, (spineTilt - 15) * 2.5);
  }

  const accuracy = Math.max(0, Math.min(100, Math.round(100 - penalty)));
  const primaryAngle = standingAngle;

  return {
    isCorrect,
    accuracy,
    feedback,
    primaryAngle,
    angles,
    rawDebug: {
      standingLeg: isLeftStanding ? 'left' : 'right',
      standingAngle,
      bentAngle,
      spineTilt,
    },
  };
}

export function evaluatePose(poseId: string, landmarks: LandmarkPoint[]): PoseEvaluation {
  if (poseId === 'tadasana') {
    return evaluateTadasana(landmarks);
  }
  if (poseId === 'vrikshasana') {
    return evaluateVrikshasana(landmarks);
  }

  return {
    isCorrect: true,
    accuracy: 90,
    feedback: 'Shanti se aasan banaye rakhein aur gehra saans lein.',
    primaryAngle: 0,
    angles: {},
  };
}
