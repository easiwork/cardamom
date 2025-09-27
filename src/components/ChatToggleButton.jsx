import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% {
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  }
  50% {
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.6), 0 0 0 10px rgba(0, 122, 255, 0.1);
  }
  100% {
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  }
`;

const ToggleButton = styled.button`
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: #007aff;
  border: none;
  border-radius: 25px;
  padding: 12px 20px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: ${props => props.isOpen ? '0.7' : '1'};

  &:hover {
    background: #0056b3;
    transform: translateY(-50%) scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
  }

  &.pulse {
    animation: ${pulse} 2s infinite;
  }

  @media (max-width: 768px) {
    right: 16px;
    padding: 10px 16px;
  }
`;

const Icon = styled.span`
  font-size: 16px;
`;

const Text = styled.span`
  font-size: 13px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ChatToggleButton = ({ onClick, isOpen }) => {
  return (
    <ToggleButton onClick={onClick} isOpen={isOpen}>
      <Icon>💬</Icon>
      <Text>Assistant</Text>
    </ToggleButton>
  );
};

export default ChatToggleButton;
