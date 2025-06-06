// Copyright 2022 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import type { FunctionComponent } from 'react';
import React, { useState } from 'react';

import { ButtonVariant } from '../Button';
import { ConfirmationDialog } from '../ConfirmationDialog';
import { SPINNER_CLASS_NAME } from './BaseConversationListItem';
import type { ParsedE164Type } from '../../util/libphonenumberInstance';
import type { LocalizerType, ThemeType } from '../../types/Util';
import { AvatarColors } from '../../types/Colors';
import type { LookupConversationWithoutServiceIdActionsType } from '../../util/lookupConversationWithoutServiceId';
import { ListTile } from '../ListTile';
import { Avatar, AvatarSize } from '../Avatar';
import { Spinner } from '../Spinner';
import { UserText } from '../UserText';

export type PropsDataType = {
  phoneNumber: ParsedE164Type;
  isChecked: boolean;
  isFetching: boolean;
};

type PropsHousekeepingType = {
  i18n: LocalizerType;
  theme: ThemeType;
  toggleConversationInChooseMembers: (conversationId: string) => void;
} & LookupConversationWithoutServiceIdActionsType;

type PropsType = PropsDataType & PropsHousekeepingType;

export const PhoneNumberCheckbox: FunctionComponent<PropsType> = React.memo(
  function PhoneNumberCheckbox({
    phoneNumber,
    isChecked,
    isFetching,
    i18n,
    lookupConversationWithoutServiceId,
    showUserNotFoundModal,
    setIsFetchingUUID,
    toggleConversationInChooseMembers,
  }) {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const onClickItem = React.useCallback(async () => {
      if (!phoneNumber.isValid) {
        setIsModalVisible(true);
        return;
      }
      if (isFetching) {
        return;
      }

      const conversationId = await lookupConversationWithoutServiceId({
        showUserNotFoundModal,
        setIsFetchingUUID,

        type: 'e164',
        e164: phoneNumber.e164,
        phoneNumber: phoneNumber.userInput,
      });

      if (conversationId !== undefined) {
        toggleConversationInChooseMembers(conversationId);
      }
    }, [
      isFetching,
      toggleConversationInChooseMembers,
      lookupConversationWithoutServiceId,
      showUserNotFoundModal,
      setIsFetchingUUID,
      setIsModalVisible,
      phoneNumber,
    ]);

    let modal: JSX.Element | undefined;
    if (isModalVisible) {
      modal = (
        <ConfirmationDialog
          dialogName="PhoneNumberCheckbox.invalidPhoneNumber"
          cancelText={i18n('icu:ok')}
          cancelButtonVariant={ButtonVariant.Secondary}
          i18n={i18n}
          onClose={() => setIsModalVisible(false)}
        >
          {i18n('icu:startConversation--phone-number-not-valid', {
            phoneNumber: phoneNumber.userInput,
          })}
        </ConfirmationDialog>
      );
    }

    const avatar = (
      <Avatar
        color={AvatarColors[0]}
        conversationType="direct"
        i18n={i18n}
        phoneNumber={phoneNumber.userInput}
        title={phoneNumber.userInput}
        sharedGroupNames={[]}
        size={AvatarSize.THIRTY_TWO}
        badge={undefined}
      />
    );

    const title = <UserText text={phoneNumber.userInput} />;

    return (
      <>
        {isFetching ? (
          <ListTile
            leading={avatar}
            title={title}
            trailing={
              <Spinner
                size="20px"
                svgSize="small"
                moduleClassName={SPINNER_CLASS_NAME}
                direction="on-progress-dialog"
              />
            }
          />
        ) : (
          <ListTile.checkbox
            isChecked={isChecked}
            onClick={onClickItem}
            leading={avatar}
            title={<UserText text={phoneNumber.userInput} />}
          />
        )}
        {modal}
      </>
    );
  }
);
