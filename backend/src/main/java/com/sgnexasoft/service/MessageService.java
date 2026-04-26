package com.sgnexasoft.service;

import com.sgnexasoft.exception.*;
import com.sgnexasoft.model.*;
import com.sgnexasoft.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public Message sendMessage(Long senderId, Long receiverId, String content, Long projectId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        Message message = Message.builder()
                .sender(sender).receiver(receiver)
                .content(content).projectId(projectId)
                .isRead(false).build();

        return messageRepository.save(message);
    }

    public List<Message> getConversation(Long userId1, Long userId2) {
        User u1 = userRepository.findById(userId1)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User u2 = userRepository.findById(userId2)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return messageRepository.findConversation(u1, u2);
    }

    public List<User> getChatPartners(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return messageRepository.findChatPartners(user);
    }

    public void markRead(Long userId1, Long userId2) {
        User sender = userRepository.findById(userId1).orElseThrow();
        User receiver = userRepository.findById(userId2).orElseThrow();
        List<Message> msgs = messageRepository.findConversation(sender, receiver);
        msgs.stream().filter(m -> m.getReceiver().getId().equals(userId2) && !m.getIsRead())
            .forEach(m -> { m.setIsRead(true); messageRepository.save(m); });
    }

    public Long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return messageRepository.countByReceiverAndIsReadFalse(user);
    }
}
