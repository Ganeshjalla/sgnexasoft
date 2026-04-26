package com.sgnexasoft.controller;

import com.sgnexasoft.repository.UserRepository;
import com.sgnexasoft.service.MessageService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    private Long getCurrentUserId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow().getId();
    }

    @PostMapping
    public ResponseEntity<?> send(@AuthenticationPrincipal UserDetails ud,
                                   @RequestBody MessageRequest req) {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(messageService.sendMessage(userId, req.receiverId, req.content, req.projectId));
    }

    @GetMapping("/conversation/{otherId}")
    public ResponseEntity<?> getConversation(@AuthenticationPrincipal UserDetails ud,
                                              @PathVariable Long otherId) {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(messageService.getConversation(userId, otherId));
    }

    @GetMapping("/partners")
    public ResponseEntity<?> getChatPartners(@AuthenticationPrincipal UserDetails ud) {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(messageService.getChatPartners(userId));
    }

    @GetMapping("/unread")
    public ResponseEntity<?> getUnread(@AuthenticationPrincipal UserDetails ud) {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(messageService.getUnreadCount(userId));
    }

    @Data static class MessageRequest {
        Long receiverId, projectId;
        String content;
    }
}
