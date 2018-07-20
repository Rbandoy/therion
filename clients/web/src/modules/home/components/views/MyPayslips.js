import React, { PureComponent } from "react";
import {
	Layout,
	Row,
} from "antd";

import thisView from "../../../../assets/myPayslips.png";

class Content extends PureComponent {
	render() {
		return (
			<Layout.Content id="dashboard-content" className="content" style={{ overflow: "initial" }}>
				<div>
					<h1>My Payslips</h1>
				</div>
				<Row gutter={16}>
					<img alt="example" src={ thisView } style={{ width: "100%" }} />
				</Row>
			</Layout.Content>
		);
	}
}

Content.propTypes = {
};

export default Content;