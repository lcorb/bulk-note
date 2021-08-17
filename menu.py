import tkinter as tk
import tkinter.scrolledtext as sb
fields = (
    {
        'label' : 'Staff first name',
        'protected': False,
        'large': False
    },
    {
        'label' : 'Staff last name',
        'protected': False,
        'large': False
    },
    {
        'label' : 'Your MIS ID',
        'protected': False,
        'large': False
    },
    {
        'label' : 'Your password',
        'protected': True,
        'large': False
    },
    {
        'label' : 'Your OneSchool PIN',
        'protected': True,
        'large': False
    },
    {
        'label' : 'Paste a list of EQIDs\n(or the footer from a compass email)',
        'protected': False,
        'large': True
    },
    {
        'label' : 'Enter the contact note details',
        'protected': False,
        'large': True
    }
)
def makeform(window, fields):
    entries = {}
    first = True
    for field in fields:
        row = tk.Frame(window, bg='slate gray', bd=2)
        lab = tk.Label(row, width=32, text=field['label'] + ": ", anchor='w', fg='white', bg='slate gray')
        if field['large']:
            ent = sb.ScrolledText(row, height=10, fg='white', bg='gray24', width=32, insertbackground='white')
            # scroll = tk.Scrollbar(ent)
            # scroll.pack( side = tk.RIGHT, fill = tk.Y )
            # scroll.config( command = ent.yview )
            # ent['yscrollcommand'] = scroll.set
        else:
            ent = tk.Entry(row, fg='white', bg='gray24', 
        show='*' if field['protected'] else '', width=32, insertbackground='white')
        row.pack(side = tk.TOP, fill = tk.X, padx = 5 , pady = 5)
        lab.pack(side = tk.LEFT)
        ent.pack(side = tk.RIGHT, expand = True, fill = tk.X)
        entries[field['label']] = ent
    return entries

def create_notes(entries):
    print(entries)
    args = []
    for entry in entries:
        entry.append(entry.get())

if __name__ == '__main__':
    window = tk.Tk()
    window.resizable(0,0)
    window.config(background='slate gray')
    window.title('Create Bulk Contact Notes')
    entry_font = {'font': ('consolas', 11)}
    entries = makeform(window, fields)
    # bg = tk.Frame(master=window, width=200, height=100, bg="gray")
    # bg.pack(fill=tk.BOTH, side=tk.LEFT, expand=True)
    # window.bind('<Return>', (lambda: create_notes(entries)))
    b1 = tk.Button(window, text = 'Create Contact Notes!', command = (lambda: create_notes(entries)))
    b1.pack(side = tk.BOTTOM, padx = 5, pady = 5)
    window.mainloop()