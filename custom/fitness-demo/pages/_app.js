import React from 'react';
import GlobalStyle from '@custom/shared/components/GlobalStyle';
import { PreCallTestModal } from '@custom/shared/components/PreCallTestModal';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { App as CustomApp } from '../components/App/App';
import BackRoomAside from '../components/Call/BackRoomAside';
import ChatAside from '../components/Call/ChatAside';
import InviteLinksModal from '../components/Call/InviteLinksModal'
import QuesAside from '../components/Call/QuesAside';
import TranscriptionAside from '../components/Call/TranscriptionAside';
import RecordingModal from '../components/Record/RecordingModal';
import RemoveUserModal from '../components/RemoveUser/RemoveUser';
import Tray from '../components/Tray';

function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Daily - {process.env.PROJECT_TITLE}</title>
      </Head>
      <GlobalStyle />
      <Component
        asides={App.asides}
        modals= {App.modals}
        customTrayComponent={App.customTrayComponent}
        customAppComponent={App.customAppComponent}
        {...pageProps}
      />
    </>
  );
}

App.defaultProps = {
  Component: null,
  pageProps: {},
};

App.propTypes = {
  Component: PropTypes.elementType,
  pageProps: PropTypes.object,
};

App.asides = [BackRoomAside,ChatAside, TranscriptionAside,QuesAside];
App.modals = [RecordingModal, InviteLinksModal, PreCallTestModal, RemoveUserModal];
App.customTrayComponent = <Tray />;
App.customAppComponent = <CustomApp />;

export default App;
