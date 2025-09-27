import React from 'react';
import styled from 'styled-components';

const TitleBar = styled.div`
  background: #e5e5e7;
  height: 28px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 12px 12px 0 0;
  -webkit-app-region: drag;
`;

const Controls = styled.div`
  display: flex;
  gap: 8px;
`;

const Control = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  -webkit-app-region: no-drag;
  background: ${props => {
    switch (props.type) {
      case 'close': return '#ff5f57';
      case 'minimize': return '#ffbd2e';
      case 'maximize': return '#28ca42';
      default: return '#ccc';
    }
  }};
`;

const MacTitleBar = () => {
  return (
    <TitleBar>
      <Controls>
        <Control type="close" />
        <Control type="minimize" />
        <Control type="maximize" />
      </Controls>
    </TitleBar>
  );
};

export default MacTitleBar;
