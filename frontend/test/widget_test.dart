import 'package:flutter_test/flutter_test.dart';
import 'package:nrityasana/main.dart';

void main() {
  testWidgets('shows the authentication screen', (tester) async {
    await tester.pumpWidget(const NrityasanaApp());
    expect(find.text('Welcome back'), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Continue with Google'), findsOneWidget);
  });
}
