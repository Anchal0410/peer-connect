import cv2
import mediapipe as mp
import easyocr
import numpy as np
import pyttsx3

# Initialize
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1)
mp_draw = mp.solutions.drawing_utils
reader = easyocr.Reader(['en'])
engine = pyttsx3.init()

def get_fingertip_coords(landmarks, frame_shape):
    h, w, _ = frame_shape
    index_finger_tip = landmarks[8]  # Index finger tip
    x = int(index_finger_tip.x * w)
    y = int(index_finger_tip.y * h)
    return (x, y)

# Start webcam
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(frame_rgb)

    # OCR
    ocr_results = reader.readtext(frame)
    for (bbox, text, _) in ocr_results:
        pts = np.array(bbox, dtype=np.int32)
        cv2.polylines(frame, [pts], True, (0, 255, 0), 2)
        cv2.putText(frame, text, tuple(pts[0]), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

    # Hand + Finger detection
    if results.multi_hand_landmarks:
        for handLms in results.multi_hand_landmarks:
            mp_draw.draw_landmarks(frame, handLms, mp_hands.HAND_CONNECTIONS)
            tip = get_fingertip_coords(handLms.landmark, frame.shape)
            cv2.circle(frame, tip, 10, (0, 0, 255), -1)

            # Check nearest OCR box
            min_dist = float('inf')
            pointed_text = None
            for (bbox, text, _) in ocr_results:
                center_x = int((bbox[0][0] + bbox[2][0]) / 2)
                center_y = int((bbox[0][1] + bbox[2][1]) / 2)
                dist = np.linalg.norm(np.array([tip[0], tip[1]]) - np.array([center_x, center_y]))
                if dist < min_dist and dist < 100:  # threshold distance
                    min_dist = dist
                    pointed_text = text

            if pointed_text:
                print(f"Pointing at: {pointed_text}")
                engine.say(pointed_text)
                engine.runAndWait()

    cv2.imshow("Real-Time OCR + Finger Detection", frame)
    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
