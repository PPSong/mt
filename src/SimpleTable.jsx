import React from 'react';
import axios from 'axios';
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
} from 'material-ui/Table';
import Modal from 'material-ui/Modal';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl, FormHelperText } from 'material-ui/Form';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Snackbar from 'material-ui/Snackbar';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';
import _ from 'lodash';

const rowHeigth = 49;

const styles = {
  page: {
    padding: 8 * 2,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: 8,
    marginRight: 8,
    width: 200,
  },
  menu: {
    width: 200,
  },
  button: {
    margin: 8,
  },
  close: {
    width: 8 * 4,
    height: 8 * 4,
  },
};

class SimpleTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      perPage: 10,
      curPage: 0,
      total: 0,
      data: [],
      editing: false,
      creating: false,
      item: null,
      snackBarOpen: false,
      msg: null,
      keyword: null,
    };

    this.handleSearchChange = _.debounce((text) => {
      this.setState(
        {
          keyword: text,
        },
        () => {
          this.getData();
        },
      );
    }, 1000);
  }

  openEdit(item) {
    this.setState({
      item,
      editing: true,
    });
  }

  closeEdit() {
    this.setState({
      item: null,
      editing: false,
    });
  }

  async saveEdit() {
    try {
      const response = await axios.put(`http://localhost:3001/common/PPs/${this.state.item.id}`, {
        name: this.state.item.name,
      });
      if (response.data.code !== 1) {
        throw new Error(response.data.msg);
      }

      this.getData();
      this.openSnackBar('保存成功!');
      this.closeEdit();
    } catch (err) {
      this.openSnackBar(err.message);
    }
  }

  renderEditModal() {
    const { item } = this.state;
    if (!item) {
      return null;
    }

    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={this.state.editing}
      >
        <Grid container style={{ marginTop: 48 }} justify="center" alignItems="flex-start">
          <Grid item style={{ minWidth: 600, maxWidth: 960 }}>
            <Paper style={styles.page}>
              <form style={styles.container} noValidate autoComplete="off">
                <TextField
                  id="id"
                  label="id"
                  style={styles.textField}
                  value={item.id}
                  margin="normal"
                />
                <TextField
                  id="name"
                  label="name"
                  style={styles.textField}
                  value={item.name}
                  onChange={event => this.handleChange('name')(event)}
                  margin="normal"
                />
                <Button
                  style={styles.button}
                  onClick={() => {
                    this.closeEdit();
                  }}
                >
                  取消
                </Button>
                <Button
                  color="primary"
                  style={styles.button}
                  onClick={() => {
                    this.saveEdit();
                  }}
                >
                  保存
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Modal>
    );
  }

  openCreate() {
    this.setState({
      item: {
        name: '',
      },
      creating: true,
    });
  }

  closeCreate() {
    this.setState({
      item: null,
      creating: false,
    });
  }

  async saveCreate() {
    try {
      const response = await axios.post('http://localhost:3001/common/PPs', {
        name: this.state.item.name,
      });
      if (response.data.code === -1) {
        throw new Error(response.data.msg);
      }

      if (response.data.code === 0) {
        this.openSnackBar(response.data.msg);
      } else {
        this.openSnackBar('新建成功!');
      }

      this.getData();
      this.closeCreate();
    } catch (err) {
      this.openSnackBar(err.message);
    }
  }

  async deleteItem(id) {
    try {
      const response = await axios.delete(`http://localhost:3001/common/PPs/${id}`);
      if (response.data.code === -1) {
        throw new Error(response.data.msg);
      }

      this.getData();

      if (response.data.code === 0) {
        this.openSnackBar(response.data.msg);
      } else {
        this.openSnackBar('删除成功!');
      }
    } catch (err) {
      this.openSnackBar(err.message);
    }
  }

  renderCreateModal() {
    const { item } = this.state;
    if (!item) {
      return null;
    }

    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={this.state.creating}
      >
        <Grid container style={{ marginTop: 48 }} justify="center" alignItems="flex-start">
          <Grid item style={{ minWidth: 600, maxWidth: 960 }}>
            <Paper style={styles.page}>
              <form style={styles.container} noValidate autoComplete="off">
                <TextField
                  id="name"
                  label="name"
                  style={styles.textField}
                  value={item.name}
                  onChange={event => this.handleChange('name')(event)}
                  margin="normal"
                />
                <Button
                  style={styles.button}
                  onClick={() => {
                    this.closeCreate();
                  }}
                >
                  取消
                </Button>
                <Button
                  color="primary"
                  style={styles.button}
                  onClick={() => {
                    this.saveCreate();
                  }}
                >
                  保存
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Modal>
    );
  }

  renderData() {
    return this.state.data.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.id}</TableCell>
        <TableCell>{item.name}</TableCell>
        <TableCell>
          <Button
            color="primary"
            style={styles.button}
            onClick={() => {
              this.openEdit(item);
            }}
          >
            编辑
          </Button>
          <Button
            color="primary"
            style={styles.button}
            onClick={() => {
              this.deleteItem(item.id);
            }}
          >
            删除
          </Button>
        </TableCell>
      </TableRow>
    ));
  }

  componentWillMount() {
    this.getData();
  }

  async getData() {
    try {
      const response = await axios.get('http://localhost:3001/common/PPs', {
        params: {
          perPage: this.state.perPage,
          curPage: this.state.curPage,
          keyword: this.state.keyword,
        },
      });
      if (response.data.code !== 1) {
        throw new Error(response.data.msg);
      }
      this.setState({
        data: response.data.data,
        total: response.data.total,
      });
    } catch (err) {
      this.openSnackBar(err.message);
    }
  }

  handleChangePage(event, page) {
    this.setState(
      {
        curPage: page,
      },
      () => {
        this.getData();
      },
    );
  }

  handleChangeRowsPerPage(event) {
    const perPage = event.target.value;
    if (perPage !== this.state.perPage) {
      this.setState(
        {
          perPage: event.target.value,
        },
        () => {
          this.getData();
        },
      );
    }
  }

  renderEmptyRows() {
    const { perPage, curPage, total } = this.state;
    const emptyRows = perPage - Math.min(perPage, total - curPage * perPage);

    if (emptyRows > 0) {
      return (
        <TableRow style={{ height: rowHeigth * emptyRows }}>
          <TableCell colSpan={6} />
        </TableRow>
      );
    }
    return null;
  }

  handleChange(fieldName) {
    return (event) => {
      this.setState({
        item: {
          ...this.state.item,
          [fieldName]: event.target.value,
        },
      });
    };
  }

  openSnackBar(msg) {
    this.setState({
      msg,
      snackBarOpen: true,
    });
  }

  closeSnackBar() {
    this.setState({
      snackBarOpen: false,
    });
  }

  renderSnackBar() {
    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={this.state.snackBarOpen}
        autoHideDuration={6000}
        onClose={() => this.closeSnackBar()}
        SnackbarContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">{this.state.msg}</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            style={styles.close}
            onClick={() => this.closeSnackBar()}
          >
            <CloseIcon />
          </IconButton>,
        ]}
      />
    );
  }

  render() {
    const { perPage, curPage, total } = this.state;

    return (
      <Paper>
        {this.renderSnackBar()}
        {this.renderCreateModal()}
        {this.renderEditModal()}
        <Button
          color="primary"
          style={styles.button}
          onClick={() => {
            this.openCreate();
          }}
        >
          新建
        </Button>
        <TextField
          id="full-width"
          label="搜索: 名称"
          margin="normal"
          onChange={(e) => {
            this.handleSearchChange(e.target.value);
          }}
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>名称</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {this.renderData()}
            {this.renderEmptyRows()}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                colSpan={2}
                count={total}
                rowsPerPage={perPage}
                page={curPage}
                backIconButtonProps={{
                  'aria-label': 'Previous Page',
                }}
                nextIconButtonProps={{
                  'aria-label': 'Next Page',
                }}
                onChangePage={(event, page) => this.handleChangePage(event, page)}
                onChangeRowsPerPage={event => this.handleChangeRowsPerPage(event)}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </Paper>
    );
  }
}

export default SimpleTable;
