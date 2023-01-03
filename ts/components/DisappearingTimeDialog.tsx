// Copyright 2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useState } from 'react';

import { ConfirmationDialog } from './ConfirmationDialog';
import { Select } from './Select';
import type { LocalizerType } from '../types/Util';
import type { Theme } from '../util/theme';
import { DurationInSeconds } from '../util/durations';

const CSS_MODULE = 'module-disappearing-time-dialog';

const DEFAULT_VALUE = 60;

export type PropsType = Readonly<{
  i18n: LocalizerType;
  theme?: Theme;
  initialValue?: DurationInSeconds;
  onSubmit: (value: DurationInSeconds) => void;
  onClose: () => void;
}>;

const UNITS = ['seconds', 'minutes', 'hours', 'days', 'weeks'];

const UNIT_TO_SEC = new Map<string, number>([
  ['seconds', 1],
  ['minutes', 60],
  ['hours', 60 * 60],
  ['days', 24 * 60 * 60],
  ['weeks', 7 * 24 * 60 * 60],
]);

const RANGES = new Map<string, [number, number]>([
  ['seconds', [1, 60]],
  ['minutes', [1, 60]],
  ['hours', [1, 24]],
  ['days', [1, 7]],
  ['weeks', [1, 5]],
]);

export function DisappearingTimeDialog(props: PropsType): JSX.Element {
  const {
    i18n,
    theme,
    initialValue = DEFAULT_VALUE,
    onSubmit,
    onClose,
  } = props;

  let initialUnit = 'seconds';
  let initialUnitValue = 1;
  for (const unit of UNITS) {
    const sec = UNIT_TO_SEC.get(unit) || 1;

    if (initialValue < sec) {
      break;
    }

    initialUnit = unit;
    initialUnitValue = Math.floor(initialValue / sec);
  }

  const [unitValue, setUnitValue] = useState(initialUnitValue);
  const [unit, setUnit] = useState(initialUnit);

  const range = RANGES.get(unit) || [1, 1];

  const values: Array<number> = [];
  for (let i = range[0]; i < range[1]; i += 1) {
    values.push(i);
  }

  return (
    <ConfirmationDialog
      dialogName="DisappearingTimerDialog"
      moduleClassName={CSS_MODULE}
      i18n={i18n}
      theme={theme}
      onClose={onClose}
      title={i18n('DisappearingTimeDialog__title')}
      hasXButton
      actions={[
        {
          text: i18n('DisappearingTimeDialog__set'),
          style: 'affirmative',
          action() {
            onSubmit(
              DurationInSeconds.fromSeconds(
                unitValue * (UNIT_TO_SEC.get(unit) ?? 1)
              )
            );
          },
        },
      ]}
    >
      <p>{i18n('DisappearingTimeDialog__body')}</p>
      <section className={`${CSS_MODULE}__time-boxes`}>
        <Select
          ariaLabel={i18n('DisappearingTimeDialog__label--value')}
          moduleClassName={`${CSS_MODULE}__time-boxes__value`}
          value={unitValue}
          onChange={newValue => setUnitValue(parseInt(newValue, 10))}
          options={values.map(value => ({ value, text: value.toString() }))}
        />
        <Select
          ariaLabel={i18n('DisappearingTimeDialog__label--units')}
          moduleClassName={`${CSS_MODULE}__time-boxes__units`}
          value={unit}
          onChange={newUnit => {
            setUnit(newUnit);

            const ranges = RANGES.get(newUnit);
            if (!ranges) {
              return;
            }

            const [min, max] = ranges;
            setUnitValue(Math.max(min, Math.min(max - 1, unitValue)));
          }}
          options={UNITS.map(unitName => {
            return {
              value: unitName,
              text: i18n(`DisappearingTimeDialog__${unitName}`),
            };
          })}
        />
      </section>
    </ConfirmationDialog>
  );
}
