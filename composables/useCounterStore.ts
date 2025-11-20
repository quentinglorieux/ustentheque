import { proxyRefs, toRefs } from "vue";

type CounterState = {
  count: number;
};

export const useCounterStore = () => {
  const state = useState<CounterState>("counter", () => ({
    count: 0,
  }));

  return proxyRefs({
    ...toRefs(state.value),
  });
};
