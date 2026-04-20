import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    lineHeight: 1.5,
  },
  text: {
    marginBottom: 10,
  },
  dynamicField: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  spacer: {
    height: 20,
  },
  image: {
    marginBottom: 10,
  },
});

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

export default function TemplatePDF({ nodes, data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {nodes.map((node) => {
          switch (node.type) {
            case 'TextBlock':
              return (
                <Text
                  key={node.id}
                  style={[
                    styles.text,
                    {
                      fontSize: node.props.fontSize || 12,
                      fontWeight: node.props.fontWeight || 'normal',
                      textAlign: node.props.textAlign || 'left',
                      color: node.props.color || '#000000',
                    },
                  ]}
                >
                  {stripHtml(node.props.content) || 'Texto'}
                </Text>
              );

            case 'DynamicField': {
              const fieldValue = data ? data[node.props.field] : '';
              return (
                <Text
                  key={node.id}
                  style={[
                    styles.text,
                    styles.dynamicField,
                    {
                      fontSize: node.props.fontSize || 12,
                      fontWeight: node.props.fontWeight || 'bold',
                    },
                  ]}
                >
                  {fieldValue || node.props.placeholder}
                </Text>
              );
            }

            case 'ImageBlock':
              return node.props.src ? (
                <Image
                  key={node.id}
                  src={node.props.src}
                  style={[
                    styles.image,
                    {
                      width: node.props.width || 200,
                      height: node.props.height || 200,
                    },
                  ]}
                />
              ) : null;

            case 'DividerBlock':
              return (
                <View
                  key={node.id}
                  style={[
                    styles.divider,
                    {
                      borderBottomWidth: node.props.thickness || 1,
                      borderBottomColor: node.props.color || '#e2e8f0',
                      marginVertical: (node.props.margin || 16) / 2,
                    },
                  ]}
                />
              );

            case 'SpacerBlock':
              return (
                <View
                  key={node.id}
                  style={[styles.spacer, { height: node.props.height || 40 }]}
                />
              );

            default:
              return null;
          }
        })}
      </Page>
    </Document>
  );
}
