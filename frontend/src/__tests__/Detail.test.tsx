import {afterEach, beforeEach, it} from 'vitest';
import {render, screen, cleanup} from '@testing-library/react';

import Detail, {type Value} from '../components/BathroomDetails/Detail';

afterEach(() => cleanup());

beforeEach(() => {
  const sampleVals: Value[] = [
    // selected value is just for CSS, so it isn't tested
    {name: 'prop_1', selected: true},
    {name: 'prop_2', selected: false}];
  render(
      <Detail
        name='Sample Detail'
        values={sampleVals} />,
  );
});

it('Renders the detail name', async () => {
  screen.getByText('Sample Detail:');
});

it('Renders all the values passed in properly formated', async () => {
  screen.getByText('Prop 1');
  screen.getByText('Prop 2');
});
