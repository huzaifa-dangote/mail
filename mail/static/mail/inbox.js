document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body = document.querySelector('#compose-body');

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  recipients.value = '';
  subject.value = '';
  body.value = '';

    document.querySelector('#submit').addEventListener('click', function () {
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: recipients.value,
                subject: subject.value,
                body: body.value
            })
        })
            .then(response => response.json())
            .then(result => {
                console.log(result);
            })
        return false;
    })
}

function reply_email(email_id) {
    const recipients = document.querySelector('#compose-recipients');
    const subject = document.querySelector('#compose-subject');
    const body = document.querySelector('#compose-body');

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
        console.log(email);

        // Pre-fill form fields
        recipients.value = `${email.sender}`;
        if (/^Re:/g.test(email.subject)) {
            subject.value = `${email.subject}`;
        }
        else {
            subject.value = `Re: ${email.subject}`;
        }
        body.value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}`;
    })

    // Submit reply
    document.querySelector('#submit').addEventListener('click', () => {
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: recipients.value,
                subject: subject.value,
                body: body.value
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
        })
        return false;
    })
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  function archive(email_id) {
      fetch(`/emails/${email_id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: true
          })
      })
      .then(response => response.json())
      .then(result => {
          console.log(result);
      })
      load_mailbox('inbox');
  }

  function unarchive(email_id) {
      fetch(`/emails/${email_id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: false
          })
      })
      .then(response => response.json())
      .then(result => {
          console.log(result);
      })
      load_mailbox('inbox');
  }

  // Email page
  function email_view(email_id) {
      document.querySelector('#email-view').innerHTML = '';
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#email-view').style.display = 'block';

      fetch(`/emails/${email_id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
      })
      .then(response => response.json())
      .then(result => {
          console.log(result);
      })

      fetch(`/emails/${email_id}`)
      .then(response => response.json())
      .then(email => {
          console.log(email);

          const p_sender = document.createElement('p');
          const p_recipients = document.createElement('p');
          const p_subject = document.createElement('p');
          const p_timestamp = document.createElement('p');
          const p_body = document.createElement('p');
          const div_meta_data = document.createElement('div');
          const reply_button = document.createElement('button');

          p_sender.innerHTML = `<strong>From:</strong> ${email.sender}`;
          p_recipients.innerHTML = `<strong>To:</strong> ${email.recipients}`;
          p_subject.innerHTML = `<strong>Subject:</strong> ${email.subject}`;
          p_timestamp.innerHTML = `<strong>Timestamp:</strong> ${email.timestamp}`;
          p_body.innerHTML = `<pre>${email.body}</pre>`;
          //body = email.body;
          //p_body.innerHTML = email.body.replace(/\n/g, "<br><br>");
          reply_button.textContent = `Reply`;

          div_meta_data.appendChild(p_sender);
          div_meta_data.appendChild(p_recipients);
          div_meta_data.appendChild(p_subject);
          div_meta_data.appendChild(p_timestamp);

          document.querySelector('#email-view').append(div_meta_data);
          document.querySelector('#email-view').append(reply_button);
          document.querySelector('#email-view').append(p_body);

          reply_button.addEventListener('click', () => reply_email(email.id))
      })
  }

  // Mailbox view
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      console.log(emails);

      for (let i in emails) {
          const div = document.createElement('div');
          const p_sender = document.createElement('p');
          const p_subject = document.createElement('p');
          const p_timestamp = document.createElement('p');
          const archive_button = document.createElement('button');
          const unarchive_button = document.createElement('button');
          const view_button = document.createElement('button');
          const email = emails[i];
          div.id = 'email-brief';
          archive_button.id = 'archive-button';

          p_sender.innerHTML = `${email.sender}`;
          p_subject.innerHTML = `${email.subject}`;
          p_timestamp.innerHTML = `${email.timestamp}`;
          view_button.textContent = 'View';
          archive_button.textContent = 'Archive';
          unarchive_button.textContent = 'Unarchive';

          div.appendChild(p_sender);
          div.appendChild(p_subject);
          div.appendChild(p_timestamp);
          div.appendChild(view_button);
          //div.appendChild(archive_button);

          if (email.read) {
              div.style.backgroundColor = 'lightgrey';
              //document.querySelector('#emails-view').append(div);
              //archive_button.addEventListener('click', archiving);
              //view_button.addEventListener('click', () => email_view(email.id));
          }

          if (mailbox === 'inbox') {
              div.appendChild(archive_button);
          }

          if (mailbox === 'archive') {
              div.appendChild(unarchive_button);
          }

          document.querySelector('#emails-view').append(div);
          view_button.addEventListener('click', () => email_view(email.id));
          archive_button.addEventListener('click', () => archive(email.id));
          unarchive_button.addEventListener('click', () => unarchive(email.id));
      }
  })
}