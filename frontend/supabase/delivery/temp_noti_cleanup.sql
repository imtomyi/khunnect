-- [검증 후] 테스트 알림 삭제
DELETE FROM notifications
WHERE user_id = 'a632bc35-c77f-49ff-8a86-c1108438b3a1' AND coffee_chat_id IS NULL;
