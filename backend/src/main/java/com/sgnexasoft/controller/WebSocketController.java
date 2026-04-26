package com.sgnexasoft.controller;

import com.sgnexasoft.service.MessageService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        // Persist message
        messageService.sendMessage(chatMessage.senderId, chatMessage.receiverId, chatMessage.content, chatMessage.projectId);

        // Send to receiver
        messagingTemplate.convertAndSendToUser(
            chatMessage.receiverId.toString(),
            "/queue/messages",
            chatMessage
        );
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload TypingEvent event) {
        messagingTemplate.convertAndSendToUser(
            event.receiverId.toString(),
            "/queue/typing",
            event
        );
    }

    @Data
    public static class ChatMessage {
        Long senderId, receiverId, projectId;
        String content, senderName;
        String type = "CHAT";
    }

    @Data
    public static class TypingEvent {
        Long senderId, receiverId;
        Boolean isTyping;
    }
}
