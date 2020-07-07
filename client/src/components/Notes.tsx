import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Form,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import {
  createNotes,
  deleteNotes,
  getNotes,
  updateNotes,
  checkAttachmentURL
} from '../api/notes-api'
import Auth from '../auth/Auth'
import { Notes } from '../types/Notes'
import Typist from 'react-typist'

interface NotesProps {
  auth: Auth
  history: History
}

interface NotesState {
  notes: Notes[]
  newNotesName: string
  loadingNotes: boolean
}

export class Note extends React.PureComponent<NotesProps, NotesState> {
  state: NotesState = {
    notes: [],
    newNotesName: '',
    loadingNotes: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newNotesName: event.target.value })
  }

  onEditButtonClick = (notesId: string) => {
    this.props.history.push(`/notes/${notesId}/edit`)
  }

  onNotesCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newNotes = await createNotes(this.props.auth.getIdToken(), {
        name: this.state.newNotesName,
        dueDate
      })
      this.setState({
        notes: [...this.state.notes, newNotes],
        newNotesName: ''
      })
    } catch {
      alert('Notes creation failed')
    }
  }

  onNotesDelete = async (notesId: string) => {
    try {
      await deleteNotes(this.props.auth.getIdToken(), notesId)
      this.setState({
        notes: this.state.notes.filter((notes) => notes.notesId != notesId)
      })
    } catch {
      alert('Notes deletion failed')
    }
  }

  onNotesCheck = async (pos: number) => {
    try {
      const notes = this.state.notes[pos]
      await updateNotes(this.props.auth.getIdToken(), notes.notesId, {
        name: notes.name,
        dueDate: notes.dueDate,
        done: !notes.done
      })
      this.setState({
        notes: update(this.state.notes, {
          [pos]: { done: { $set: !notes.done } }
        })
      })
    } catch {
      alert('Notes update failed')
    }
  }

  onCheckAttachmentURL = async (
    notes: Notes,
    pos: number
  ): Promise<boolean> => {
    try {
      const response = notes.attachmentUrl
        ? await checkAttachmentURL(notes.attachmentUrl)
        : false

      this.setState({
        notes: update(this.state.notes, {
          [pos]: { validUrl: { $set: response } }
        })
      })

      return true
    } catch {
      return false
    }
  }

  async componentDidMount() {
    try {
      const notes = await getNotes(this.props.auth.getIdToken())

      this.setState({
        notes,
        loadingNotes: false
      })

      this.state.notes.map(async (notes, pos) => {
        notes['validUrl'] = notes.attachmentUrl
          ? await this.onCheckAttachmentURL(notes, pos)
          : false

        return notes
      })
    } catch (e) {
      alert(`Failed to fetch notes: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Typist>
          <Header as="h1">Your Thoughts...</Header>
        </Typist>
        {this.renderCreateNotesInput()}

        {this.renderNotes()}
      </div>
    )
  }

  renderCreateNotesInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Notes Entry',
              onClick: this.onNotesCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Dear notes..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderNotes() {
    if (this.state.loadingNotes) {
      return this.renderLoading()
    }

    return this.renderNotesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading your thoughts...
        </Loader>
      </Grid.Row>
    )
  }

  renderNotesList() {
    return (
      <Grid padded>
        {this.state.notes.map((notes, pos) => {
          return (
            <Grid.Row key={notes.notesId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onNotesCheck(pos)}
                  checked={notes.done}
                />
              </Grid.Column>

              <Grid.Column width={10} verticalAlign="middle">
                {notes.name}
              </Grid.Column>

              <Grid.Column width={3} floated="right">
                {notes.dueDate}
              </Grid.Column>

              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(notes.notesId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>

              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onNotesDelete(notes.notesId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>

              {notes.attachmentUrl && notes.validUrl ? (
                <Image
                  src={notes.attachmentUrl}
                  size="small"
                  wrapped
                  centered
                />
              ) : null}

              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate())
    return dateFormat(date, 'yyyy-mm-dd hh:mm:ss') as string
  }
}
