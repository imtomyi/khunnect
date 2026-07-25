-- [임시 검증용] test-student에게 테스트 알림 1개 삽입
-- actor는 test-senior (커피챗 수락 알림 흉내). 검증 후 아래 DELETE로 정리.
INSERT INTO notifications (user_id, actor_id, type, coffee_chat_id)
VALUES (
  'a632bc35-c77f-49ff-8a86-c1108438b3a1',   -- test-student (받는 사람)
  '4eae1683-1ade-4fc7-8b84-7030b9f0ac1f',   -- test-senior (유발자)
  'coffee_chat_accepted', NULL
);
