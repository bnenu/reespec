/**
 * Searchable multi-select prompt for reespec CLI.
 * Ported from openspec (MIT) — https://github.com/Fission-AI/OpenSpec
 *
 * Features:
 * - Type to filter choices
 * - ↑↓ to navigate
 * - Space to toggle selection
 * - Backspace to remove last selected item (or delete search char)
 * - Enter to confirm
 */

import chalk from 'chalk';

async function createSearchableMultiSelect() {
  const {
    createPrompt,
    useState,
    useKeypress,
    useMemo,
    usePrefix,
    isEnterKey,
    isBackspaceKey,
    isUpKey,
    isDownKey,
  } = await import('@inquirer/core');

  return createPrompt((config, done) => {
    const { message, choices, pageSize = 15, validate } = config;
    const [searchText, setSearchText] = useState('');
    const [selectedValues, setSelectedValues] = useState(
      () => choices.filter(c => c.preSelected).map(c => c.value)
    );
    const [cursor, setCursor] = useState(0);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);
    const prefix = usePrefix({ status });

    // Filter choices by search text
    const filteredChoices = useMemo(() => {
      if (!searchText.trim()) return choices;
      const term = searchText.toLowerCase();
      return choices.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.value.toLowerCase().includes(term)
      );
    }, [searchText, choices]);

    const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);
    const choiceMap = useMemo(
      () => new Map(choices.map(c => [c.value, c])),
      [choices]
    );

    useKeypress(key => {
      if (status === 'done') return;

      // Enter — confirm
      if (isEnterKey(key)) {
        if (validate) {
          const result = validate(selectedValues);
          if (result !== true) {
            setError(typeof result === 'string' ? result : 'Invalid selection');
            return;
          }
        }
        setStatus('done');
        done(selectedValues);
        return;
      }

      // Space — toggle current item
      if (key.name === 'space') {
        const choice = filteredChoices[cursor];
        if (choice) {
          if (selectedSet.has(choice.value)) {
            setSelectedValues(selectedValues.filter(v => v !== choice.value));
          } else {
            setSelectedValues([...selectedValues, choice.value]);
          }
        }
        return;
      }

      // Backspace — remove last selected or delete search char
      if (isBackspaceKey(key)) {
        if (searchText === '' && selectedValues.length > 0) {
          setSelectedValues(selectedValues.slice(0, -1));
        } else {
          setSearchText(searchText.slice(0, -1));
          setCursor(0);
        }
        return;
      }

      // Navigation
      if (isUpKey(key)) {
        setCursor(Math.max(0, cursor - 1));
        return;
      }
      if (isDownKey(key)) {
        setCursor(Math.min(filteredChoices.length - 1, cursor + 1));
        return;
      }

      // Printable character — add to search
      if (key.name && key.name.length === 1 && !key.ctrl && !key.meta) {
        setSearchText(searchText + key.name);
        setCursor(0);
      }
    });

    // Done state — single line summary
    if (status === 'done') {
      const names = selectedValues
        .map(v => choiceMap.get(v)?.name ?? v)
        .join(', ');
      return `${prefix} ${chalk.bold(message)} ${chalk.cyan(names || '(none)')}`;
    }

    // Active state
    const lines = [];
    lines.push(`${prefix} ${chalk.bold(message)}`);

    // Selected chips
    const chips = selectedValues.length > 0
      ? selectedValues
          .map(v => chalk.bgCyan.black(` ${choiceMap.get(v)?.name ?? v} `))
          .join(' ')
      : chalk.dim('(none selected)');
    lines.push(`  Selected: ${chips}`);

    // Search box
    lines.push(
      `  Search: ${chalk.yellow('[')}${searchText || chalk.dim('type to filter')}${chalk.yellow(']')}`
    );

    // Instructions
    lines.push(
      `  ${chalk.cyan('↑↓')} navigate  ${chalk.cyan('Space')} toggle  ${chalk.cyan('Backspace')} remove  ${chalk.cyan('Enter')} confirm`
    );

    // Choice list with pagination
    if (filteredChoices.length === 0) {
      lines.push(chalk.yellow('  No matches'));
    } else {
      const startIndex = Math.max(
        0,
        Math.min(cursor - Math.floor(pageSize / 2), filteredChoices.length - pageSize)
      );
      const endIndex = Math.min(startIndex + pageSize, filteredChoices.length);
      const visible = filteredChoices.slice(startIndex, endIndex);

      for (let i = 0; i < visible.length; i++) {
        const item = visible[i];
        const actualIndex = startIndex + i;
        const isActive = actualIndex === cursor;
        const selected = selectedSet.has(item.value);
        const icon = selected ? chalk.green('◉') : chalk.dim('○');
        const arrow = isActive ? chalk.cyan('›') : ' ';
        const name = isActive ? chalk.cyan(item.name) : item.name;
        const suffix = selected
          ? chalk.dim(' (selected)')
          : item.detected
          ? chalk.dim(' (detected)')
          : '';
        lines.push(`  ${arrow} ${icon} ${name}${suffix}`);
      }

      if (filteredChoices.length > pageSize) {
        const currentPage = Math.floor(cursor / pageSize) + 1;
        const totalPages = Math.ceil(filteredChoices.length / pageSize);
        lines.push(chalk.dim(`  (${currentPage}/${totalPages})`));
      }
    }

    if (error) lines.push(chalk.red(`  ${error}`));
    return lines.join('\n');
  });
}

export async function searchableMultiSelect(config) {
  const prompt = await createSearchableMultiSelect();
  return prompt(config);
}

export default searchableMultiSelect;
