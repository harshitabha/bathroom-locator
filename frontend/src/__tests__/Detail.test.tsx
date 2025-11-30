import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {render, screen, cleanup} from '@testing-library/react';

import Detail from '../components/Detail';
import type {IndexObject} from '../types';

afterEach(() => cleanup());

const sampleVals: IndexObject<boolean> = {
  // selected value is just for CSS, so it isn't tested
  'prop_1': true,
  'prop_2': false,
};

describe('Non clickable chip', async () => {
  beforeEach(() => {
    render(
        <Detail
          name='Sample Detail'
          values={sampleVals}
          handleClick={() => {}} />,
    );
  });

  it('Renders the detail name', async () => {
    screen.getByText('Sample Detail:');
  });

  it('Renders all the values passed in properly formated', async () => {
    screen.getByText('Prop 1');
    screen.getByText('Prop 2');
  });

  it('Chips don\'t have aria lables', async () => {
    const lable = screen.queryByLabelText('Select Prop 2');
    expect(lable).toBeNull();
  });
});

describe('Clickable chip', async () => {
  beforeEach(() => {
    render(
        <Detail
          name='Sample Detail'
          values={sampleVals}
          handleClick={() => {}}
          chipEditable={true}/>,
    );
  });

  it('Select aria label exists selected chip', async () => {
    screen.getByLabelText('Select Prop 2');
  });

  it('Select aria label exists unselected chip', async () => {
    screen.getByLabelText('Unselect Prop 1');
  });
  // Note: To avoid recreating the handleClick method & state the click
  // implementation will be tested in bathroom details
});
