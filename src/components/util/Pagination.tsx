import { createElement, useEffect, useRef } from 'react';
import { Icon, Menu, PaginationItem, PaginationItemProps } from 'semantic-ui-react';
// import { ConfigCenter, ConfigPath } from '../../util/config';
import { checkIntRange, clipInt, range } from '../../util/nt';
import { stripLeadingZero } from '../../util/string';

interface PaginationProps {
	readonly page: number;
	readonly total: number;
	readonly onPageChange: (activePage: number) => void;
}

// const paginationPath = new ConfigPath(['pagination']);
function getPageList(page: number, total: number) {
	const config = 4 as (number | string) /* paginationPath.get(ConfigCenter.getState().config) */, list = [page];
	if (config === 'doubling') {
		for (let i = 2; i <= page; i <<= 1) list.unshift(page - i + 1);
		for (let i = 2; i <= total - page + 1; i <<= 1) list.push(page + i - 1);
	} else if (config === 'binary') {
		for (let i = page - 1; i > 0; i &= i - 1) list.unshift(i);
		for (let i = page + 1; i <= total; i |= i - 1, ++i) list.push(i);
	} else {
		const
			extend = clipInt(config, 1, 10, 4),
			min = Math.max(Math.min(page, total - extend) - extend, 1),
			max = Math.min(Math.max(page, 1 + extend) + extend, total);
		return range(min, max + 1);
	}
	return list;
}

function current_beforeInput(e: InputEvent) {
	if (typeof e.data === 'string' && /\D/.test(e.data)) {
		e.preventDefault();
	}
}

function current_input(this: HTMLDivElement) {
	let newText = stripLeadingZero(this.textContent!.replace(/\D/g, ''));
	if (newText === '0')
		newText = '';
	if (this.textContent !== newText) {
		const sel = document.getSelection()!, anch = sel.anchorNode, offset = sel.focusOffset + newText.length - this.textContent!.length, cond = this.contains(anch) && sel.focusNode === anch;
		this.textContent = newText;
		if (sel && cond && this.firstChild)
			sel.collapse(this.firstChild, Math.max(offset, 0));
	}
}

function current_dinput(this: HTMLDivElement, e: InputEvent) {
	if (!e.isComposing) current_input.call(this);
}

const Pagination: React.FC<PaginationProps> = props => {
	if (!(props.total > 1)) return null;

	const pageList = getPageList(props.page, props.total);

	const handlePaginationItemClick = (_: React.MouseEvent<HTMLAnchorElement>, { value }: PaginationItemProps) => props.onPageChange(value);

	const fulfill = (div: HTMLDivElement, focus: boolean) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const p = Number(div.textContent), q = (div as any)._cur_page;
		if (checkIntRange(p, 1, props.total)) {
			p === q || (div.blur(), props.onPageChange(p));
		} else {
			div.textContent = q.toString();
			if (!focus) return;
			const sel = document.getSelection();
			if (!sel) return;
			const anch = sel.anchorNode;
			if (!(anch && div.contains(anch) && sel.focusNode === anch)) return;
			const text = anch.textContent;
			if (!text) return;
			sel.collapse(anch, text.length);
		}
	}

	function current_keypress(this: HTMLDivElement, e: KeyboardEvent) {
		if (e.code === 'Enter') {
			e.preventDefault();
			fulfill(this, true);
		}
	}

	function current_blur(this: HTMLDivElement) {
		fulfill(this, false);
	}

	const currentRef = useRef<HTMLDivElement>(null);
	const current = <div key="current" className="active item" contentEditable={"plaintext-only" as unknown as true} ref={currentRef} />;
	useEffect(() => {
		if (currentRef.current) {
			const div = currentRef.current;
			div.addEventListener('beforeinput', current_beforeInput);
			div.addEventListener('compositionend', current_input);
			div.addEventListener('input', current_dinput as unknown as (this: HTMLDivElement, ev: Event) => void);
			div.addEventListener('keypress', current_keypress);
			div.addEventListener('blur', current_blur);
			return () => {
				div.removeEventListener('beforeinput', current_beforeInput);
				div.removeEventListener('compositionend', current_input);
				div.removeEventListener('input', current_dinput as unknown as (this: HTMLDivElement, ev: Event) => void);
				div.removeEventListener('keypress', current_keypress);
				div.removeEventListener('blur', current_blur);
			};
		}
	}, []);

	useEffect(() => {
		if (currentRef.current) {
			const div = currentRef.current;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(div as any)._cur_page = props.page;
			if (div.textContent !== props.page.toString()) {
				div.textContent = props.page.toString();
			}
		}
	});

	return (
		<Menu pagination>
			<PaginationItem icon disabled={props.page === 1} value={1} onClick={handlePaginationItemClick}><Icon name='angle double left' /></PaginationItem>
			<PaginationItem icon disabled={props.page === 1} value={props.page - 1} onClick={handlePaginationItemClick}><Icon name='angle left' /></PaginationItem>
			{pageList.map(page => page === props.page ? current : <PaginationItem content={page} key={page} value={page} onClick={handlePaginationItemClick} />)}
			<PaginationItem icon disabled={props.page === props.total} value={props.page + 1} onClick={handlePaginationItemClick}><Icon name='angle right' /></PaginationItem>
			<PaginationItem icon disabled={props.page === props.total} value={props.total} onClick={handlePaginationItemClick}><Icon name='angle double right' /></PaginationItem>
		</Menu>
	);
};

Pagination.displayName = 'Pagination';

export default Pagination;
