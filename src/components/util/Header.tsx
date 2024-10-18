import { createElement } from 'react';
import { Container, Menu } from 'semantic-ui-react';

const Header: React.FC = () => {
	return (
		<Menu fixed="top" borderless>
			<Container>
				<Menu.Item>
					<img src="/machine.png" style={{ marginRight: '.71428571rem' }} />
					<img src="/cellxx.png" style={{ width: '7.5rem' }} />
				</Menu.Item>
				<Menu.Menu position="right">
					<img src="/iiis.png" style={{ height: '3rem', margin: 'auto' }} />
				</Menu.Menu>
			</Container>
		</Menu>
	);
}

Header.displayName = 'Header';

export default Header;
